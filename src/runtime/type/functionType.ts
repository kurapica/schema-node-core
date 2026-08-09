// =============================================================================
// FunctionType — runtime type for function schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/FunctionType.cs
//
// Execution modes:
//   1. System function:  stored _systemFn → direct invocation
//   2. Composite (exps): walks expression tree, calls sub-functions
//   3. Remote:           if any sub-expression depends on a server-only function,
//                        the entire call goes through schemaProvider via queue+cache
// =============================================================================

import type { ValueType } from './valueType';
import { NodeType } from './nodeType';
import { StructType } from './structType';
import { ArrayType } from './arrayType';
import { FuncProperty, type FuncArg, type FuncExp, type CallArg, type FunctionSchema } from '../../schema/functionSchema';
import { ExpType } from '../../enum/expType';
import { getPropertiesBySchemaKind, getProperty } from '../../property/propertyOwner';
import { getNodeType } from '../schemaRuntime';
import { getSchemaProvider } from '../../schema/provider/schemaProvider';
import { isEmpty, isNull, useQueueQuery } from '../../utility/toolset';
import { Converter, IProperty, isTypeRefProperty, ITypeRefProperty, NoCache, PropertyCtor, ServerOnly } from '../../property';
import { SCHEMA_KIND_ARRAY, SCHEMA_KIND_FUNC_ARG, SCHEMA_KIND_FUNCTION } from '../../utility/constant';
import { INodeReference, IPropertyProvider, joinProperties } from '..';

/** Shared result cache for remote calls (keyed by token). */
const shareFuncCallResult = new Map<string, unknown>();

/** Pending remote call queues to avoid duplicate concurrent calls. */
const pendingCall: Record<string, { resolve: (v: unknown) => void; reject: (e: unknown) => void }[]> = {};

/** Queue remote callFunction through useQueueQuery to serialize requests. */
const callSchemaFunctionQueue = useQueueQuery(
  (schemaName: string, args: unknown[], retType?: string) =>
    getSchemaProvider()!.callFunction(schemaName, args, retType),
);

/** Delay (ms) to batch concurrent remote calls before execution. */
const REMOTE_CALL_DELAY = 50;

/** Temporary dedup tree for complex-arg remote calls: schemaName → nested Map → "CALL_QUEUE". */
const pendingComplexCall: Record<string, Map<any, any>> = {};

/** Runtime type for function schemas. */
export class FunctionType extends NodeType {
  /** Return value type (resolved at load time). */
  returnType?: ValueType;

  /** Argument definitions. */
  get args(): FuncArgType[] { return this._argTypes ?? [] } 

  /** Expression tree (for composite functions). */
  get exps(): FuncExp[] { return this._funcSchema?.exps ?? [] }

  /** Whether this function has a local system function implementation. */
  get isSystem(): boolean { return !!this._systemFn; }

  /** Whether this function requires remote call (server-only or depends on server-only). */
  get isRemote(): boolean { return this._serverOnly; }

  /** Whether this is a converter function. */
  get isConverter(): boolean { return this._converter; }

  // ── Internals ───────────────────────────────────────────────────────

  private _funcSchema?: FunctionSchema;
  private _argTypes?: FuncArgType[];
  private _systemFn?: (...args: unknown[]) => unknown;
  private _converter = false;
  private _serverOnly = false;
  private _noCache = false;
  private _built = false;
  private _compositeFn?: (...args: unknown[]) => unknown;
  private _funcMap?: Map<string, FunctionType>

  // ── Loading ─────────────────────────────────────────────────────────

  override loadProperties(): IProperty[] {
    this._funcSchema = getProperty(this.schema, FuncProperty)?.getValue();
    return this._funcSchema ? Array.from(getPropertiesBySchemaKind(this._funcSchema, SCHEMA_KIND_FUNCTION)) : [];
  }

  override async load() {
    if (!this._funcSchema) return;

    // Load argument types
    this._argTypes = this._funcSchema.args.map(arg => new FuncArgType(arg));
    for(const argType of this._argTypes) await argType.load();
    this._systemFn = this._funcSchema.func as ((...args: unknown[]) => unknown) | undefined;
    this._converter = this.getProperty(Converter)?.getValue() ?? false;
    this._serverOnly = this.getProperty(ServerOnly)?.getValue() ?? (this.exps.length === 0 && !this.isSystem);
    this._noCache = this.getProperty(NoCache)?.getValue() ?? false;

    // Resolve return type
    this.returnType = await getNodeType(this._funcSchema.return, this.generics, this.genericParams) as ValueType | undefined;
  }

  override unload(): void {
    this._funcMap = undefined;
    this._built = false;
  }

  override *getRefTypes(): Generator<NodeType> {
    if (this.returnType)
      yield this.returnType;
    for (const argType of this._argTypes ?? [])
      yield* argType.getRefTypes();
    yield* super.getRefTypes();
  }

  // ── Call ────────────────────────────────────────────────────────────

  /**
   * Call this function with the given arguments.
   * - System fn → direct
   * - Composite → interpret expression tree (recursive sub-calls)
   * - Remote → queue + cache via schemaProvider
   */
  async call(args: unknown[]): Promise<unknown> {
    // Build composite function if not yet built
    if (!this._built)
      await this._buildComposite();

    // 1. System function — direct invocation
    if (this._systemFn && !this.isRemote)
      return this._callSystem(args);

    // 2. Composite function — local execution
    if (this._compositeFn && !this.isRemote)
      return this._callLocalComposite(args);

    // 3. Remote call — via schema provider with queue + cache
    return this._callRemote(this.name, args);
  }

  /** Direct system function invocation. */
  private _callSystem(args: unknown[]): unknown {
    return this._systemFn!(...args);
  }

  /** Local composite execution (all sub-functions resolved locally). */
  private _callLocalComposite(args: unknown[]): unknown {
    return this._compositeFn!(...args);
  }

  // ── Remote Call with Queue + Cache ──────────────────────────────────

  /**
   * Remote function call via schemaProvider, with:
   * - Shared result cache (nocache skips)
   * - Pending call dedup (avoids concurrent duplicate calls)
   * - Complex-arg tree dedup (nested Map keyed by arg values)
   * - Delay-based batching (REMOTE_CALL_DELAY ms)
   * - Queue-based serialization via useQueueQuery
   */
  private async _callRemote(schemaName: string, args: unknown[]): Promise<unknown> {
    if (!getSchemaProvider()) throw new Error('Schema provider not provided');

    // Token-based cache for simple (serializable) args
    const token = this._buildCacheToken(schemaName, args);

    if (token) {
      // Check shared cache
      const cached = shareFuncCallResult.get(token);
      if (cached !== undefined) return cached;

      // Dedup concurrent calls
      if (pendingCall[token])
        return new Promise((resolve, reject) => pendingCall[token].push({ resolve, reject }));

      pendingCall[token] = [];

      // Delay to batch concurrent requests in the same tick
      await new Promise(resolve => setTimeout(resolve, REMOTE_CALL_DELAY));

      try {
        const res = await callSchemaFunctionQueue(schemaName, args);
        if (!this._noCache) shareFuncCallResult.set(token, res);
        pendingCall[token].forEach(c => c.resolve(res));
        return res;
      } catch (ex) {
        pendingCall[token].forEach(c => c.reject(ex));
        throw ex;
      } finally {
        delete pendingCall[token];
      }
    }

    // ── Complex args — nested Map dedup ──────────────────────────

    // Build / walk nested Map tree keyed by arg values
    let root = pendingComplexCall[schemaName];
    if (!root) {
      root = new Map();
      pendingComplexCall[schemaName] = root;
    }

    for (const arg of args) {
      const key = isNull(arg) ? 'NULL_TOKEN' : arg;
      let next = root.get(key);
      if (!next) {
        next = new Map();
        root.set(key, next);
      }
      root = next;
    }

    // Check if there's already a pending call for this exact arg set
    let queue = root.get('CALL_QUEUE');
    if (queue)
      return new Promise((resolve, reject) => queue.push({ resolve, reject }));

    // Init queue
    queue = [];
    root.set('CALL_QUEUE', queue);

    // Delay to batch concurrent requests
    await new Promise(resolve => setTimeout(resolve, REMOTE_CALL_DELAY));

    // Reset tree for next batch
    delete pendingComplexCall[schemaName];

    try {
      const res = await callSchemaFunctionQueue(schemaName, args);
      queue.forEach((c: any) => c.resolve(res));
      return res;
    } catch (ex) {
      queue.forEach((c: any) => c.reject(ex));
      throw ex;
    }
  }

  /** Build a cache token for simple argument sets. */
  private _buildCacheToken(schemaName: string, args: unknown[]): string | null {
    if (!args || args.length === 0) return schemaName;
    const complexIdx = args.findIndex(a => a && typeof a === 'object');
    if (complexIdx >= 0) return null;
    return `${schemaName}:${JSON.stringify(args)}`;
  }

  // ── Composite Build ─────────────────────────────────────────────────

  /**
   * Attempt to build a composite function from the expression tree.
   * If any sub-expression references a server-only function, mark as remote
   * and fall back to schemaProvider remote call.
   */
  private async _buildComposite(): Promise<void> {
    if (this._built) return;
    this._built = true;
    if (!this.exps.length) return;

    try {
      this._compositeFn = await this._compileExpressions(this.exps, this.args);
    } catch {
      this._serverOnly = true;
    }
  }

  /** Recursively compile expressions into an executable function. */
  private async _compileExpressions(
    exps: FuncExp[],
    args: FuncArg[],
  ): Promise<((...callArgs: unknown[]) => unknown) | undefined> {
    const argNames = args.map(a => a.name);

    // Build type dictionary: name → ValueType (args + expressions)
    const expTypes = new Map<string, ValueType | undefined>();
    for (const arg of args)
      expTypes.set(arg.name, await getNodeType(arg.type) as ValueType | undefined);

    // Build compiled expression info (with type-informed array analysis)
    const compiledExps: CompiledExp[] = [];
    for (const exp of exps) {

      // Resolve the called function's type for arg type analysis
      const calledFunc = await getNodeType(exp.func) as FunctionType | undefined;
      if (!calledFunc) return undefined;
      await calledFunc._buildComposite();

      // Gets the function
      const expFn = calledFunc._systemFn ?? calledFunc._compositeFn;

      if (calledFunc._noCache) this._noCache = true;
      if (calledFunc._serverOnly || !expFn)
      {
        this._serverOnly = true;
        return undefined;
      }

      // Resolve return type and store
      const expRetType = await getNodeType(exp.return) as ValueType | undefined;
      expTypes.set(exp.name, expRetType);

      // Analyze array dependencies using type compatibility
      const arrayInfo = exp.type !== ExpType.Call
        ? await _analyzeArrayDepsByType(exp, calledFunc, expTypes)
        : undefined;

      // Build require flags from called function's arg nullability
      const requireFlags: boolean[] = [];
      if (exp.args && calledFunc) {
        for (let i = 0; i < exp.args.length; i++) {
          const fnArg = calledFunc.args[i];
          requireFlags.push(fnArg ? !(fnArg as any).nullable : false);
        }
      }

      compiledExps.push({ fn: expFn, funcName: exp.func, exp, arrayInfo, requireFlags });
    }

    const objFields = await _resolveStructReturnFields(
      this.returnType,
      exps.length > 0 ? exps[exps.length - 1].return : undefined,
      this.generics,
      this.genericParams,
    );

    return async (...callArgs: unknown[]): Promise<unknown> => {
      const expValues: Record<string, unknown> = {};
      for (let i = 0; i < argNames.length; i++)
        expValues[argNames[i]] = callArgs[i];

      for (const comp of compiledExps) {
        const argsVal: unknown[] = [];
        let valid = true;
        const arrayVal = comp.arrayInfo?.arrayName ? (_getExpValue(comp.arrayInfo.arrayName, expValues) ?? []) : null;

        if (comp.exp.args) {
          for (let j = 0; j < comp.exp.args.length; j++) {
            const arg = comp.exp.args[j];

            // If this position is array-dependent, push placeholder
            if (comp.arrayInfo?.arrayIndexes.includes(j) && comp.arrayInfo.sourceArrayIdx >= 0) {
              argsVal.push(arrayVal); // placeholder, replaced later
              continue;
            }

            const v = arg.source ? _getExpValue(arg.source, expValues) : arg.value;
            if (isNull(v) && comp.requireFlags[j] && !(comp.exp.type === ExpType.Reduce && j === 1)) {
              valid = false;
              break;
            }
            argsVal.push(v);
          }
        }

        if (!valid) {
          expValues[comp.exp.name] = null;
          continue;
        }

        const interruptResult = _checkInterrupt(comp.funcName, argsVal);
        if (interruptResult !== undefined) return interruptResult;

        // process exp
        const result = this._executeExpressionWithInfo(comp.fn, comp.exp, argsVal, comp.arrayInfo);
        expValues[comp.exp.name] = result instanceof Promise ? await result : result;
      }

      if (objFields?.length) {
        const result: Record<string, unknown> = {};
        for (const field of objFields)
          result[field] = expValues[field];
        return result;
      }

      return expValues[exps[exps.length - 1].name];
    };
  }

  /** Execute a single expression with array-dependency info. */
  private async _executeExpressionWithInfo(
    fn: Function,
    exp: FuncExp,
    val: unknown[],
    arrayInfo: ArrayDepInfo | undefined,
  ): Promise<unknown> {
    if (exp.type === ExpType.Call)
      return fn(...val);

    if (!arrayInfo || arrayInfo.sourceArrayIdx < 0) return null;

    const sourceArray = val[arrayInfo.sourceArrayIdx] as unknown[] | undefined;
    if (!sourceArray || !Array.isArray(sourceArray)) return null;

    const { arrayIndexes, arrayName } = arrayInfo;

    switch (exp.type) {
      case ExpType.Map:
        return Promise.all(sourceArray.map((elem) =>
          fn(..._replaceArrayElements(val, arrayIndexes, arrayName, elem, exp.args)),
        ));

      case ExpType.Filter:
        return (await Promise.all(sourceArray.map(async (elem) => {
          const testVals = _replaceArrayElements(val, arrayIndexes, arrayName, elem, exp.args);
          return (await fn(...testVals)) ? elem : undefined;
        }))).filter(Boolean);

      case ExpType.Reduce: {
        let acc = val.length > 1 && val[1] !== undefined ? val[1] : sourceArray[0];
        const startIdx = val.length > 1 && val[1] !== undefined ? 0 : 1;
        for (let j = startIdx; j < sourceArray.length; j++) {
          const reduced = _replaceArrayElements(val, arrayIndexes, arrayName, sourceArray[j], exp.args);
          reduced[1] = acc;
          acc = await fn(...reduced);
        }
        return acc;
      }

      case ExpType.First:
        for (const elem of sourceArray) {
          const testVals = _replaceArrayElements(val, arrayIndexes, arrayName, elem, exp.args);
          if (await fn(...testVals)) return elem;
        }
        return undefined;

      case ExpType.Last: {
        let last: unknown;
        for (const elem of sourceArray) {
          const testVals = _replaceArrayElements(val, arrayIndexes, arrayName, elem, exp.args);
          if (await fn(...testVals)) last = elem;
        }
        return last;
      }

      case ExpType.Count: {
        let count = 0;
        for (const elem of sourceArray) {
          const testVals = _replaceArrayElements(val, arrayIndexes, arrayName, elem, exp.args);
          if (await fn(...testVals)) count++;
        }
        return count;
      }

      case ExpType.All:
        for (const elem of sourceArray) {
          const testVals = _replaceArrayElements(val, arrayIndexes, arrayName, elem, exp.args);
          if (!(await fn(...testVals))) return false;
        }
        return true;

      case ExpType.Any:
        for (const elem of sourceArray) {
          const testVals = _replaceArrayElements(val, arrayIndexes, arrayName, elem, exp.args);
          if (await fn(...testVals)) return true;
        }
        return false;

      default:
        return fn(...val);
    }
  }
}

export class FuncArgType implements INodeReference, IPropertyProvider {
  private _funcArg: FuncArg;
  private _props: IProperty[];
  private _refTypes?: NodeType[];

  /** Get the name of the function argument */
  get name() { return this._funcArg.name; }

  /** Get the type of the function argument */
  get type() { return this._funcArg.type; }

  constructor(funcArg: FuncArg) {
    this._funcArg = funcArg;
    this._props = Array.from(getPropertiesBySchemaKind(funcArg, SCHEMA_KIND_FUNC_ARG));
  }

  async load(){
    const refTypes: NodeType[] = []
    for(let prop of this._props.filter(isTypeRefProperty))
    {
      for(let n of (prop as ITypeRefProperty).getRefTypes())
      {
        const type = await getNodeType(n);
        if (type && !refTypes.includes(type))
          refTypes.push(type);
      }
    }
    this._refTypes = refTypes;
  }

  // ── Reference Types ─────────────────────────────────────────────────

  *getRefTypes(): Generator<NodeType> {
    if (this._refTypes)
      yield* this._refTypes;
  }

  // ── Property Access ─────────────────────────────────────────────────

  /** Get property by type */
  getProperty<T extends IProperty>(propCtor: new () => T): T | undefined {
    return this._props?.find(p => p instanceof propCtor) as T;
  }

  /** Gets the property value */
  getPropertyValue<T>(propCtor: PropertyCtor): T | undefined { return this.getProperty(propCtor)?.getValue() as T; }

  /** Get properties by type */
  *getProperties<T extends IProperty>(propCtor: new () => T): Generator<T> {
    if (!this._props) return;
    for(let prop of this._props)
    {
      if (prop instanceof propCtor)
        yield prop as T;
    }
  }

  /** Filter properties by predicate */
  *filterProperties(predicate: (prop: IProperty) => boolean): Generator<IProperty> {
    if (!this._props) return;
    for(let prop of this._props)
    {
      if (predicate(prop))
        yield prop;
    }
  }
}

// ── Array Dependency Analysis (Type-Based) ────────────────────────────────

/** Info about how array elements substitute into expression arguments. */
interface ArrayDepInfo {
  /** Indices of args that reference the array (directly or via sub-path). */
  arrayIndexes: number[];
  /** The source name (argument/expression name) of the array. */
  arrayName: string;
  /** Index in val[] where the source array lives (at build time we can't know — resolved at runtime from the first matching index). */
  sourceArrayIdx: number;
}

/** Compiled expression with type-informed metadata. */
interface CompiledExp {
  fn: Function;
  funcName: string;
  exp: FuncExp;
  arrayInfo?: ArrayDepInfo;
  requireFlags: boolean[];
}

/**
 * Analyze array dependencies using type compatibility (old buildFunction approach).
 * 
 * For each expression arg whose referenced type is NOT an array in the called function's
 * parameter list, but IS an array in the expression context → that's the array source.
 * Also handles nested struct field access to find arrays.
 */
async function _analyzeArrayDepsByType(
  exp: FuncExp,
  calledFunc: FunctionType | undefined,
  expTypes: Map<string, ValueType | undefined>,
): Promise<ArrayDepInfo | undefined> {
  if (!exp.args || !exp.args.length || !calledFunc) return undefined;

  const arrayIndexes: number[] = [];
  let arrayName: string | undefined;
  let sourceArrayIdx = -1;

  for (let j = 0; j < Math.min(calledFunc.args.length, exp.args.length); j++) {
    const expArg = exp.args[j];
    if (!expArg.source) continue;

    // If the called function already expects an array for this param — skip
    const fnArgType = await getNodeType(calledFunc.args[j].type) as ValueType | undefined;
    if (fnArgType?.kind === SCHEMA_KIND_ARRAY) continue;

    // Find the array source: walk the source path to find which prefix resolves to an ArrayType
    const sourceInfo = _findArraySourceByType(expArg.source, expTypes);
    if (!sourceInfo) continue;

    if (arrayName && arrayName !== sourceInfo.sourceName) {
      console.warn(`Multiple array sources in expression ${exp.name}`);
      return undefined;
    }

    arrayName = sourceInfo.sourceName;
    arrayIndexes.push(j);

    if (sourceInfo.direct) sourceArrayIdx = j;
  }

  if (!arrayName || arrayIndexes.length === 0) return undefined;
  if (sourceArrayIdx < 0) sourceArrayIdx = arrayIndexes[0];

  return { arrayIndexes, arrayName, sourceArrayIdx };
}

/**
 * Walk a source path through the type dictionary to find which prefix is an ArrayType.
 * Returns the source name and whether it's a direct match.
 * 
 * e.g. source="items.name" → if "items" is ArrayType → { sourceName: "items", direct: false }
 *                               if "items" is StructType with "name" field → check field type → ...
 */
function _findArraySourceByType(
  source: string,
  expTypes: Map<string, ValueType | undefined>,
): { sourceName: string; direct: boolean } | undefined {
  if (!source) return undefined;

  const parts = source.split('.');
  let type = expTypes.get(parts[0]);

  // Direct: the first part is an array
  if (type instanceof ArrayType)
    return { sourceName: parts[0], direct: parts.length === 1 };

  for (let i = 1; i < parts.length; i++) {
    type = type?.getAccessValueType(parts[i]);
    if (!type) break;
    if (type instanceof ArrayType) {
      return { sourceName: parts.slice(0, i + 1).join('.'), direct: false };
    }
  }

  return undefined;
}

function _getExpValue(source: string, exps: Record<string, unknown>)
{
  if (!source) return undefined;
  const parts = source.split('.');
  let value: any = exps[parts[0]];
  for (let i = 1; i < parts.length; i++)
  {
    if (isNull(value)) return null;
    value = value[parts[i]];
  }
  return value;
}

/**
 * Replace array-dependent elements in the argument list.
 * Mirrors the old schema-node replaceArray logic.
 */
function _replaceArrayElements(
  val: unknown[],
  arrayIndexes: number[],
  arrayName: string,
  element: unknown,
  args?: CallArg[],
): unknown[] {
  const result = [...val];

  for (const idx of arrayIndexes) {
    if (idx >= result.length || !args) continue;

    const source = args[idx]?.source;
    if (!source) {
      result[idx] = element;
      continue;
    }

    if (source === arrayName) {
      // Direct match — replace whole arg with element
      result[idx] = element;
    } else if (source.startsWith(arrayName + '.')) {
      // Sub-path — extract from element
      const subPath = source.substring(arrayName.length + 1);
      result[idx] = _extractSubValue(element, subPath);
    } else {
      // Also direct but source name differs (e.g. nested struct access)
      result[idx] = element;
    }
  }

  return result;
}

/** Extract a nested value from an object by dotted path. */
function _extractSubValue(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (isNull(current)) break;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

// ── Struct Return Fields ─────────────────────────────────────────────────

/**
 * If the return type is a StructType and the last expression's return type
 * is NOT assignable to it, collect struct field names for result construction.
 */
async function _resolveStructReturnFields(
  returnType: ValueType | undefined,
  lastExpReturn: string | undefined,
  generics?: import('../../property/index').GenericParameter[],
  genericParams?: NodeType[],
): Promise<string[] | undefined> {
  if (!(returnType instanceof StructType) || !lastExpReturn) return undefined;

  const lastExpType = await getNodeType(lastExpReturn, generics, genericParams) as ValueType | undefined;
  if (!lastExpType) return undefined;

  if (lastExpType.isAssignableTo(returnType)) return undefined;

  const fields = [...returnType.getFields()];
  if (!fields.length) return undefined;

  return fields.map(f => f.name);
}

// ── Interrupt Intrinsic Helpers ─────────────────────────────────────────

/**
 * Interrupt intrinsic function names that cause early return from composite execution.
 * Each checker receives the resolved argument values and returns:
 *   { interrupt: true, value }  if execution should stop
 *   { interrupt: false }        otherwise
 */
const INTERRUPT_CHECKERS: Record<string, (args: unknown[]) => { interrupt: true; value: unknown } | { interrupt: false }> = {
  'system.intrinsic.ifret': (args) =>
    args[0] ? { interrupt: true, value: args[1] } : { interrupt: false },

  'system.intrinsic.ifnot': (args) =>
    !args[0] ? { interrupt: true, value: args[1] } : { interrupt: false },

  'system.intrinsic.ifnull': (args) =>
    isNull(args[0]) ? { interrupt: true, value: args[1] } : { interrupt: false },

  'system.intrinsic.ifempty': (args) =>
    isEmpty(args[0]) ? { interrupt: true, value: args[1] } : { interrupt: false },
};

/** Check interrupt condition and return the value if interrupted, or undefined. */
function _checkInterrupt(funcName: string, args: unknown[]): unknown | undefined {
  const checker = INTERRUPT_CHECKERS[funcName];
  if (!checker) return undefined;
  const result = checker(args);
  return result.interrupt ? result.value : undefined;
}
