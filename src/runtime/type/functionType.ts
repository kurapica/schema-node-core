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
import { FuncProperty, type FuncArg, type FuncExp, type CallArg, type FunctionSchema } from '../../schema/functionSchema';
import { ExpType } from '../../enum/expType';
import { getPropertiesBySchemaKind, getProperty } from '../../property/propertyOwner';
import { getNodeType } from '../schemaRuntime';
import { getSchemaProvider } from '../../schema/provider/schemaProvider';
import { isEmpty, isNull, useQueueQuery } from '../../utility/toolset';
import { Converter, IProperty, NoCache, ServerOnly } from '../../property';
import { SCHEMA_KIND_FUNCTION } from '../../utility/constant';

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

export class FunctionType extends NodeType {
  /** Return value type (resolved at load time). */
  returnType?: ValueType;

  /** Argument definitions. */
  get args(): FuncArg[] { return this._funcSchema?.args ?? [] } 

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
    return this._funcSchema ? getPropertiesBySchemaKind(this._funcSchema, SCHEMA_KIND_FUNCTION) : [];
  }

  override async load() {
    if (!this._funcSchema) return;

    this._systemFn = this._funcSchema.func as ((...args: unknown[]) => unknown) | undefined;
    this._converter = this.getProperty(Converter)?.getValue() ?? false;
    this._serverOnly = this.getProperty(ServerOnly)?.getValue() ?? this.exps.length === 0 && !this.isSystem;
    this._noCache = this.getProperty(NoCache)?.getValue() ?? false;

    // Resolve return type
    this.returnType = await getNodeType(this._funcSchema.return, this.generics, this.genericParams) as ValueType | undefined;
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
  ): Promise<(...callArgs: unknown[]) => unknown> {
    const argNames = args.map(a => a.name);

    // Build sub-expression functions with array-dependency info
    const expFunctions = new Map<string, ExpCompileInfo>();
    for (const exp of exps) {
      const expFn = await this._resolveExpFunction(exp);
      if (!expFn) throw new Error(`Cannot resolve expression function: ${exp.func}`);

      const arrayInfo = exp.type !== ExpType.Call
        ? _analyzeArrayDeps(exp, argNames)
        : undefined;

      expFunctions.set(exp.name, { fn: expFn, funcName: exp.func, arrayInfo });
    }

    // Check if return type is a struct and last expression's result doesn't match →
    // need to construct result from field names (matching exp names + arg names).
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

      for (const exp of exps) {
        const info = expFunctions.get(exp.name)!;

        const argsVal: unknown[] = [];
        if (exp.args) {
          for (const arg of exp.args) {
            argsVal.push(arg.source ? expValues[arg.source] : arg.value);
          }
        }

        const interruptResult = _checkInterrupt(info.funcName, argsVal);
        if (interruptResult !== undefined) return interruptResult;

        const result = await this._executeExpressionWithInfo(info.fn, exp, argsVal, info.arrayInfo);
        expValues[exp.name] = result;
      }

      // If return type is struct that needs field construction, build result object
      if (objFields?.length) {
        const result: Record<string, unknown> = {};
        for (const field of objFields) {
          result[field] = expValues[field] ?? callArgs[argNames.indexOf(field)];
        }
        return result;
      }

      return expValues[exps[exps.length - 1].name];
    };
  }

  /** Resolve a function reference from an expression. */
  private async _resolveExpFunction(exp: FuncExp): Promise<Function | undefined> {
    const funcType = await getNodeType(exp.func, this.generics, this.genericParams) as FunctionType | undefined;
    if (!funcType) return undefined;
    if (funcType._noCache) this._noCache = true;
    if (funcType._serverOnly) {
      this._serverOnly = true;
      return undefined;
    }
    if (funcType._systemFn) return funcType._systemFn as Function;

    if (!funcType._built) await funcType._buildComposite();
    if (funcType._compositeFn) return funcType._compositeFn;

    this._serverOnly = true;
    return undefined;
  }

  /** Execute a single expression with array-dependency info. */
  private async _executeExpressionWithInfo(
    fn: Function,
    exp: FuncExp,
    val: unknown[],
    arrayInfo: ArrayDepInfo | undefined,
  ): Promise<unknown> {
    // Direct call — no array operations
    if (exp.type === ExpType.Call) {
      return fn(...val);
    }

    if (!arrayInfo) return null;

    // Get the source array from the pre-analyzed index
    const sourceArray = val[arrayInfo.arrayIndex] as unknown[] | undefined;
    if (!sourceArray || !Array.isArray(sourceArray)) return null;

    const { arrayIndex, arrayIndexes } = arrayInfo;

    switch (exp.type) {
      case ExpType.Map:
        return Promise.all(sourceArray.map((elem) =>
          fn(..._replaceArrayElements(val, arrayIndex, arrayIndexes, elem, exp.args)),
        ));

      case ExpType.Filter:
        return (await Promise.all(sourceArray.map(async (elem) => {
          const testVals = _replaceArrayElements(val, arrayIndex, arrayIndexes, elem, exp.args);
          return (await fn(...testVals)) ? elem : undefined;
        }))).filter(Boolean);

      case ExpType.Reduce: {
        let acc = val.length > 1 && val[1] !== undefined ? val[1] : sourceArray[0];
        const startIdx = val.length > 1 && val[1] !== undefined ? 0 : 1;
        for (let j = startIdx; j < sourceArray.length; j++) {
          const reduced = _replaceArrayElements(val, arrayIndex, arrayIndexes, sourceArray[j], exp.args);
          reduced[1] = acc;
          acc = await fn(...reduced);
        }
        return acc;
      }

      case ExpType.First:
        for (const elem of sourceArray) {
          const testVals = _replaceArrayElements(val, arrayIndex, arrayIndexes, elem, exp.args);
          if (await fn(...testVals)) return elem;
        }
        return undefined;

      case ExpType.Last: {
        let last: unknown;
        for (const elem of sourceArray) {
          const testVals = _replaceArrayElements(val, arrayIndex, arrayIndexes, elem, exp.args);
          if (await fn(...testVals)) last = elem;
        }
        return last;
      }

      case ExpType.Count: {
        let count = 0;
        for (const elem of sourceArray) {
          const testVals = _replaceArrayElements(val, arrayIndex, arrayIndexes, elem, exp.args);
          if (await fn(...testVals)) count++;
        }
        return count;
      }

      case ExpType.All:
        for (const elem of sourceArray) {
          const testVals = _replaceArrayElements(val, arrayIndex, arrayIndexes, elem, exp.args);
          if (!(await fn(...testVals))) return false;
        }
        return true;

      case ExpType.Any:
        for (const elem of sourceArray) {
          const testVals = _replaceArrayElements(val, arrayIndex, arrayIndexes, elem, exp.args);
          if (await fn(...testVals)) return true;
        }
        return false;

      default:
        return fn(...val);
    }
  }
}

// ── Array Dependency Analysis ──────────────────────────────────────────

/**
 * If the return type is a StructType and the last expression's return type
 * is NOT assignable to it, collect struct field names for result construction.
 * Mirrors the old schema-node objFields logic using isSchemaCanBeUseAs.
 */
async function _resolveStructReturnFields(
  returnType: ValueType | undefined,
  lastExpReturn: string | undefined,
  generics?: import('../../property/index').GenericParameter[],
  genericParams?: NodeType[],
): Promise<string[] | undefined> {
  if (!(returnType instanceof StructType) || !lastExpReturn) return undefined;

  // Resolve the last expression's return type
  const lastExpType = await getNodeType(lastExpReturn, generics, genericParams) as ValueType | undefined;
  if (!lastExpType) return undefined;

  // If the last expression's return type IS assignable to the struct → no field construction needed
  if (lastExpType.isAssignableTo(returnType)) return undefined;

  // Not assignable → construct result from struct field names
  const fields = returnType.getFields();
  if (!fields.length) return undefined;

  return fields.map(f => f.name);
}

// ── Array Dependency Helpers ───────────────────────────────────────────

/** Info about how array elements substitute into expression arguments. */
interface ArrayDepInfo {
  /** Index in the val[] array that holds the source array. */
  arrayIndex: number;
  /** Indices of args that reference the array (directly or via sub-path). */
  arrayIndexes: number[];
  /** The source name (argument/expression name) of the array. */
  arrayName: string;
}

/** Compiled expression info with array-dependency metadata. */
interface ExpCompileInfo {
  fn: Function;
  funcName: string;
  arrayInfo?: ArrayDepInfo;
}

/**
 * Analyze which expression arguments reference an array source.
 * For non-Call expressions (Map/Filter/Reduce/etc.), determines:
 *   - Which arg is the source array
 *   - Which other args reference it (directly or via sub-paths like "array.field.name")
 */
function _analyzeArrayDeps(exp: FuncExp, argNames: string[]): ArrayDepInfo | undefined {
  if (!exp.args || !exp.args.length) return undefined;

  const arrayIndexes: number[] = [];
  let arrayName: string | undefined;
  let arrayIndex = -1;

  for (let i = 0; i < exp.args.length; i++) {
    const source = exp.args[i].source;
    if (!source) continue;

    // Find which arg name is an array source prefix
    const match = _findArraySource(source, argNames);
    if (!match) continue;

    if (arrayName && arrayName !== match.sourceName) {
      console.warn(`Multiple array sources in expression ${exp.name}`);
      return undefined;
    }

    arrayName = match.sourceName;
    arrayIndexes.push(i);

    // If this is a direct reference, record the array index
    if (match.direct) {
      arrayIndex = i;
    }
  }

  if (!arrayName || arrayIndexes.length === 0) return undefined;

  // If we found indirect refs but no direct, use the first arrayIndexes entry
  if (arrayIndex < 0) arrayIndex = arrayIndexes[0];

  return { arrayIndex, arrayIndexes, arrayName };
}

/**
 * Find which argument name is the array source for a given source path.
 * e.g. source="items" → { sourceName: "items", direct: true }
 *      source="items.name" → { sourceName: "items", direct: false }
 */
function _findArraySource(source: string, argNames: string[]): { sourceName: string; direct: boolean } | undefined {
  const dotIdx = source.indexOf('.');
  const prefix = dotIdx >= 0 ? source.substring(0, dotIdx) : source;
  if (argNames.includes(prefix)) {
    return { sourceName: prefix, direct: source === prefix };
  }
  return undefined;
}

/**
 * Replace array-dependent elements in the argument list.
 * Mirrors the old schema-node replaceArray logic:
 *   - Direct reference: replace with element
 *   - Sub-path reference (e.g. "array.field.name"): extract nested value from element
 */
function _replaceArrayElements(
  val: unknown[],
  arrayIndex: number,
  arrayIndexes: number[],
  element: unknown,
  args?: CallArg[],
): unknown[] {
  const result = [...val];

  for (const idx of arrayIndexes) {
    if (idx >= result.length || !args) continue;

    const source = args[idx]?.source;
    if (!source) {
      // Direct array element replacement
      result[idx] = element;
      continue;
    }

    // Check if direct match or sub-path
    // Find the array source name (the first segment of `source`)
    const dotIdx = source.indexOf('.');
    if (dotIdx < 0) {
      // Direct match — replace whole arg with element
      result[idx] = element;
    } else {
      // Sub-path — extract from element: "array.field.name" → element.field.name
      const subPath = source.substring(dotIdx + 1);
      result[idx] = _extractSubValue(element, subPath);
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
