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

import { ApplyMode } from '../../enum/applyMode/type';
import { getPropertiesBySchemaKind, getPropertyValue } from '../../property/propertyOwner';
import { getSchemaProvider } from '../../schema/provider';
import { isEmpty, isNull, splitString, useQueueQuery } from '../../utility/toolset';
import { NodeType } from '../node/runtime';
import { ValueType } from '../value/runtime';
import { getNodeType } from '../../runtime/context';
import { isTypeRefProperty } from '../../property/typeRefProperty';
import { Name } from '../../property/core/name';
import { RelationType } from '../relation/runtime';
import { logger } from '../../utility/logger';

import type { FuncArg, FuncExp, CallArg, FunctionSchema } from './type';
import type { IProperty, PropertyCtor, INodeReference, IValueTypeAccess, IPropertyProvider, INodeType, IRelation, IValueAccess } from '../../interface';
import type { Entry } from '../../struct/entry/type';
import type { ITypeRefProperty } from '../../property/typeRefProperty';
import type { GenericParameter } from '../generic/type';
import type { RelationSchema } from '../relation/type';

import { NODE_SELF, TYPE_PROVIDER, NS_SYSTEM_STRING, SCHEMA_KIND_ARRAY, SCHEMA_KIND_FUNC_ARG, SCHEMA_KIND_FUNCTION, SCHEMA_KIND_STRUCT } from '../../utility/constant';

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
  get args(): FunArgsType { return this._args! }  

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
  private _args?: FunArgsType;
  private _systemFn?: (...args: unknown[]) => unknown;
  private _converter = false;
  private _serverOnly = false;
  private _noCache = false;
  private _built = false;
  private _compositeFn?: (...args: unknown[]) => unknown;
  private _funcMap?: Map<string, FunctionType>;

  // ── Loading ─────────────────────────────────────────────────────────

  override loadProperties(): IProperty[] {
    this._funcSchema = getPropertyValue<FunctionSchema>(this.schema, "func");
    return this._funcSchema ? Array.from(getPropertiesBySchemaKind(this._funcSchema, SCHEMA_KIND_FUNCTION)) : [];
  }

  override async load() {
    if (!this._funcSchema) return;

    // Load argument types
    this._args = new FunArgsType(this._funcSchema.args);
    await this._args.load(this.generics, this.genericParams);
    this._systemFn = this._funcSchema.func as ((...args: unknown[]) => unknown) | undefined;
    this._converter = this.getProperty("Converter")?.getValue() ?? false;
    this._serverOnly = this.getProperty("ServerOnly")?.getValue() ?? (this.exps.length === 0 && !this.isSystem);
    this._noCache = this.getProperty("NoCache")?.getValue() ?? false;

    // Resolve return type
    this.returnType = await getNodeType(this._funcSchema.return, this.generics, this.genericParams) as ValueType | undefined;

    if (this._converter && this._args.length == 1 && this.returnType)
      this._args.at(0)?.valueType?.addConverter(this.returnType, this);
  }

  override unload(): void {
    if (this._converter && this._args?.length == 1 && this.returnType)
      this._args.at(0)?.valueType?.removeConverter(this.returnType, this);
    
    this._funcMap = undefined;
    this._built = false;
  }

  override *getRefTypes(): Generator<INodeType> {
    if (this.returnType)
      yield this.returnType;
    if (this._args)
      for (const argType of this._args)
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
  async call(args: unknown[], applyMode: ApplyMode = ApplyMode.Call): Promise<unknown> {
    try
    {
      let res: unknown;

      // Build composite function if not yet built
      if (!this._built)
        await this._buildComposite();

      // 1. Remote Call — via schemaProvider with queue + cache
      if (this.isRemote)
        res = await this._callRemote(this.name, args, applyMode);

      else if (applyMode === ApplyMode.Call) {
        res = await this._callLocale(args);
      }

      // Collection mode
      else 
      {
        // indicate the colletion
        let arrIdx = -1;
        for (let i = 0; i < this.args.length; i++) {
          if (this.args.at(i)?.valueType?.kind !== SCHEMA_KIND_ARRAY && Array.isArray(args[i])) {
            arrIdx = i;
            break;
          }
        }

        if (arrIdx >= 0)
        {
          args = [...args]; // avoid mutate original args
          const col = args[arrIdx] as unknown[];
          switch (applyMode)
          {
            /** Map mode */
            case ApplyMode.Map:
            {
              const result:unknown[] = [];
              for (let item of col){
                args[arrIdx] = item;
                const r = await this._callLocale(args);
                if (!isNull(r)) result.push(r);
              }
              res = result;
              break;
            }
            /** Filter mode */
            case ApplyMode.Filter:
            {
              const result:unknown[] = [];
              for (let item of col){
                args[arrIdx] = item;
                if (await this._callLocale(args)) 
                  result.push(item);
              }
              res = result;
              break;
            }
            /** Reduce mode */
            case ApplyMode.Reduce:
            {
              const resIdx = arrIdx == 0 ? 1 : 0;
              let startIdx = 0;
              while (isNull(args[resIdx]))
                args[resIdx] = col[startIdx++];

              for (let item = col[startIdx]; item !== undefined; item = col[startIdx++] as unknown){
                args[arrIdx] = item;
                const r = await this._callLocale(args);
                if (!isNull(r)) args[resIdx] = r;
              }
              res = args[resIdx];
              break;
            }
            /** First mode */
            case ApplyMode.First: 
            {
              for (let item of col){
                args[arrIdx] = item;
                if (await this._callLocale(args)) {
                  res = item;
                  break;
                }
              }
              break;
            }
            /** Last mode */
            case ApplyMode.Last: 
            {
              for (let i = col.length - 1; i >= 0; i--){
                const item = col[i];
                args[arrIdx] = item;
                if (await this._callLocale(args)) {
                  res = item;
                  break;
                }
              }
              break;
            }
            /** Count mode */
            case ApplyMode.Count:
            {
              let count = 0;
              for (let item of col){
                args[arrIdx] = item;
                if (await this._callLocale(args)) count++;
              }
              res = count;
              break;
            }
            /** All mode */
            case ApplyMode.All:
            {
              res = true;
              for (let item of col){
                args[arrIdx] = item;
                if (!await this._callLocale(args)) {
                  res = false;
                  break;
                }
              }
              break;
            }
            /** Any mode */
            case ApplyMode.Any:
            {
              res = false;
              for (let item of col){
                args[arrIdx] = item;
                if (await this._callLocale(args)) {
                  res = true;
                  break;
                }
              }
              break;
            }
          }
        }
      }

      logger.verbose('[Function][Call]', this.name, args, res);
      return res;
    }
    catch (ex)
    {
      logger.error('[Function][Call]', this.name, args, ex);
      throw ex;
    }
  }

  private async _callLocale(args: unknown[]): Promise<unknown> {
    const func = this._systemFn ?? this._compositeFn;
    if (!func) return undefined;
    let res = func(...args);
    if (res instanceof Promise) res = await res;
    return res;
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
  private async _callRemote(schemaName: string, args: unknown[], applyMode: ApplyMode = ApplyMode.Call): Promise<unknown> {
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
        const res = await callSchemaFunctionQueue(schemaName, args, applyMode);
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
      this._compositeFn = await this._compileExpressions(this.exps, this.args.getArgs());
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
      const call = exp.call;

      // Resolve the called function's type for arg type analysis
      const calledFunc = await getNodeType(call.func) as FunctionType | undefined;
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
      const arrayInfo = call.mode !== ApplyMode.Call
        ? await _analyzeArrayDepsByType(exp, calledFunc, expTypes)
        : undefined;

      // Build require flags from called function's arg nullability
      const requireFlags: boolean[] = [];
      if (call.args && calledFunc) {
        for (let i = 0; i < call.args.length; i++) {
          const fnArg = calledFunc.args.at(i);
          requireFlags.push(fnArg?.require ?? false);
        }
      }

      compiledExps.push({ fn: expFn, funcName: call.func, exp, arrayInfo, requireFlags });
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

        if (comp.exp.call.args) {
          for (let j = 0; j < comp.exp.call.args.length; j++) {
            const arg = comp.exp.call.args[j];

            // If this position is array-dependent, push placeholder
            if (comp.arrayInfo?.arrayIndexes.includes(j) && comp.arrayInfo.sourceArrayIdx >= 0) {
              argsVal.push(arrayVal); // placeholder, replaced later
              continue;
            }

            const v = arg.source ? _getExpValue(arg.source, expValues) : arg.value;
            if (isNull(v) && comp.requireFlags[j] && !(comp.exp.call.mode === ApplyMode.Reduce && j === 1)) {
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
    if (exp.call.mode === ApplyMode.Call)
      return fn(...val);

    if (!arrayInfo || arrayInfo.sourceArrayIdx < 0) return null;

    const sourceArray = val[arrayInfo.sourceArrayIdx] as unknown[] | undefined;
    if (!sourceArray || !Array.isArray(sourceArray)) return null;

    const { arrayIndexes, arrayName } = arrayInfo;

    switch (exp.call.mode) {
      case ApplyMode.Map:
        return Promise.all(sourceArray.map((elem) =>
          fn(..._replaceArrayElements(val, arrayIndexes, arrayName, elem, exp.call.args)),
        ));

      case ApplyMode.Filter:
        return (await Promise.all(sourceArray.map(async (elem) => {
          const testVals = _replaceArrayElements(val, arrayIndexes, arrayName, elem, exp.call.args);
          return (await fn(...testVals)) ? elem : undefined;
        }))).filter(Boolean);

      case ApplyMode.Reduce: {
        let acc = val.length > 1 && val[1] !== undefined ? val[1] : sourceArray[0];
        const startIdx = val.length > 1 && val[1] !== undefined ? 0 : 1;
        for (let j = startIdx; j < sourceArray.length; j++) {
          const reduced = _replaceArrayElements(val, arrayIndexes, arrayName, sourceArray[j], exp.call.args);
          reduced[1] = acc;
          acc = await fn(...reduced);
        }
        return acc;
      }

      case ApplyMode.First:
        for (const elem of sourceArray) {
          const testVals = _replaceArrayElements(val, arrayIndexes, arrayName, elem, exp.call.args);
          if (await fn(...testVals)) return elem;
        }
        return undefined;

      case ApplyMode.Last: {
        let last: unknown;
        for (const elem of sourceArray) {
          const testVals = _replaceArrayElements(val, arrayIndexes, arrayName, elem, exp.call.args);
          if (await fn(...testVals)) last = elem;
        }
        return last;
      }

      case ApplyMode.Count: {
        let count = 0;
        for (const elem of sourceArray) {
          const testVals = _replaceArrayElements(val, arrayIndexes, arrayName, elem, exp.call.args);
          if (await fn(...testVals)) count++;
        }
        return count;
      }

      case ApplyMode.All:
        for (const elem of sourceArray) {
          const testVals = _replaceArrayElements(val, arrayIndexes, arrayName, elem, exp.call.args);
          if (!(await fn(...testVals))) return false;
        }
        return true;

      case ApplyMode.Any:
        for (const elem of sourceArray) {
          const testVals = _replaceArrayElements(val, arrayIndexes, arrayName, elem, exp.call.args);
          if (await fn(...testVals)) return true;
        }
        return false;

      default:
        return fn(...val);
    }
  }
}

/** The type of function arguments */
export class FunArgsType implements INodeReference, IValueTypeAccess, Iterable<FuncArgType> {
  private _args: FuncArgType[];
  private _stringType?: ValueType;
  private _relations: IRelation[] = [];

  constructor(args: FuncArg[]) {
    this._args = args.map(a => new FuncArgType(a));
  }
  get name(): string { return '' }
  get kind(): string { return SCHEMA_KIND_FUNC_ARG; }
  isAssignableTo(other: IValueTypeAccess): boolean { return false; }
  getProperty<T extends IProperty>(propCtor: PropertyCtor | string): T | undefined { return undefined }
  getPropertyValue<T>(propCtor: PropertyCtor | string): T | undefined { return undefined }
  *getProperties<T extends IProperty>(propCtor: PropertyCtor | string): Generator<T> { return }
  *getPropertyValues<T>(propCtor: PropertyCtor | string): Generator<T> { for (let prop of this.getProperties(propCtor)) yield prop.getValue() as T; }
  *filterProperties(predicate: (prop: IProperty) => boolean): Generator<IProperty> { return }
  create(value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider): IValueAccess { throw new Error("Method not implemented."); }

  async load(generics?: GenericParameter[], genericParams?: INodeType[]) {
    this._stringType = await getNodeType(NS_SYSTEM_STRING) as ValueType;
    await Promise.all(this._args.map(a => a.load(generics, genericParams)));

    // load relations
    for (const a of this._args)
    {
      const relations = a.getPropertyValue<RelationSchema[]>("Relations");
      if (relations?.length)
      {
        for (const r of relations) {
          const relation = new RelationType(r, this);
          await relation.load();
          this._relations.push(relation);
        }
      }
    }
  }
  
  // ── Relations ───────────────────────────────────────────────────────

  /** Get all relation types. */
  *getRelations(): Generator<IRelation> {
    if (!this._relations?.length) return;
    yield* this._relations;
  }

  /** Get relations for a specific field name. */
  *getRelationsForArg(argName: string): Generator<IRelation> {
    if (!this._relations?.length) return;
    for(const relation of this._relations)
      if (relation.target?.toLowerCase() === argName.toLowerCase() || relation.target?.toLowerCase().startsWith(argName.toLowerCase() + '.'))
        yield relation;
  }

  // ── Iterable ──────────────────────────────────────────────────────────────

  /** Number of arguments. */
  get length(): number { return this._args?.length ?? 0; }

  /** Get all function arguments. */
  getArgs(): FuncArgType[] {
    return [...this._args];
  }

  [Symbol.iterator](): Iterator<FuncArgType, any, any> {
    return this._args[Symbol.iterator]();
  }

  map<T>(callback: (value: FuncArgType, index: number) => T): T[] {
    return this._args.map(callback);
  }

  /** Get the function argument by name or index. */
  at(argName: string | number): FuncArgType | undefined {
    if (typeof argName === 'number')
      return this._args[argName];
    return this._args.find(a => a.name.toLowerCase() === argName.toLowerCase());
  }

  // ── Path Navigation ───────────────────────────────────────────────────────

  /** Get the access value type */
  getAccessValueType(path: string): ValueType | undefined {
    if (isEmpty(path) || path === NODE_SELF) return undefined;
    path = path.toLowerCase();

    const dotIdx = path.indexOf('.');
    const first = dotIdx >= 0 ? path.substring(0, dotIdx) : path;
    const remain = dotIdx >= 0 ? path.substring(dotIdx + 1) : '';
    const arg = this._args.find(a => a.name.toLowerCase() === first);
    if (!arg) return undefined;
    if (remain === NODE_SELF) return this._stringType;
    if (remain === TYPE_PROVIDER) return this._stringType;
    return arg.valueType;
  }

  /** Get the access entries */
  getAccessEntries(): Entry<string>[] {
    return []
  }

  /** Whether this node has access entries. */
  get hasAccessEntries(): boolean { return !!this._args.length; }

  // ── Reference Types ─────────────────────────────────────────────────

  /** Get all reference types. */
  *getRefTypes(): Generator<INodeType> {
    for(let a of this._args)
      yield* a.getRefTypes();
  }
}

/** The type of function argument */
export class FuncArgType implements INodeReference, IPropertyProvider {
  private _funcArg: FuncArg;
  private _props: IProperty[];
  private _refTypes?: INodeType[];
  private _valueType?: ValueType;

  /** Get the name of the function argument */
  get name() { return this._funcArg.name; }

  /** Get the type of the function argument */
  get type() { return this._valueType?.name ?? this._funcArg.type; }

  /** Get the value type of the function argument */
  get valueType() { return this._valueType; }

  /** Whether the function argument is required. */
  get require() { return this.getPropertyValue<boolean>("Require") ?? false; }

  /** Whether the function argument is variadic. */
  get variadic() { return this.getPropertyValue<boolean>("Variadic") ?? false; }

  constructor(funcArg: FuncArg) {
    this._funcArg = funcArg;
    this._props = Array.from(getPropertiesBySchemaKind(funcArg, SCHEMA_KIND_FUNC_ARG));
    const name = new Name();
    name.setValue(this.name);
    this._props.unshift(name);
  }

  async load(generics?: GenericParameter[], genericParams?: INodeType[]) {
    this._valueType = await getNodeType(this._funcArg.type, generics, genericParams) as ValueType;

    const refTypes: INodeType[] = []
    for(let prop of this._props.filter(isTypeRefProperty))
    {
      for(let n of (prop as unknown as ITypeRefProperty).getRefTypes())
      {
        const type = await getNodeType(n);
        if (type && !refTypes.includes(type))
          refTypes.push(type);
      }
    }
    this._refTypes = refTypes;
  }

  // ── Reference Types ─────────────────────────────────────────────────

  *getRefTypes(): Generator<INodeType> {
    if (this._refTypes)
      yield* this._refTypes;
  }

  // ── Property Access ─────────────────────────────────────────────────

  /** Get property by type */
  getProperty<T extends IProperty>(propCtor: PropertyCtor | string): T | undefined {
    return this._props?.find(p => typeof propCtor === 'string' ? p.name.toLowerCase() === propCtor.toLowerCase() : p instanceof propCtor) as T;
  }

  /** Gets the property value */
  getPropertyValue<T>(propCtor: PropertyCtor | string): T | undefined { return this.getProperty(propCtor)?.getValue() as T; }

  /** Get properties by type */
  *getProperties<T extends IProperty>(propCtor: PropertyCtor | string): Generator<T> {
    if (!this._props) return;
    for(let prop of this._props)
    {
      if (typeof propCtor === 'string' ? prop.name.toLowerCase() === propCtor.toLowerCase() : prop instanceof propCtor)
        yield prop as T;
    }
  }

  /** Gets the property values */
  *getPropertyValues<T>(propCtor: PropertyCtor | string): Generator<T> { for (let prop of this.getProperties(propCtor)) yield prop.getValue() as T; }

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
  if (!exp.call.args || !exp.call.args.length || !calledFunc) return undefined;

  const arrayIndexes: number[] = [];
  let arrayName: string | undefined;
  let sourceArrayIdx = -1;

  for (let j = 0; j < Math.min(calledFunc.args.length, exp.call.args.length); j++) {
    const expArg = exp.call.args[j];
    if (!expArg.source) continue;

    // If the called function already expects an array for this param — skip
    const fnArgType = await getNodeType(calledFunc.args.at(j)?.type ?? '')  as ValueType | undefined;
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

  const parts = splitString(source);
  let type = expTypes.get(parts[0]);

  // Direct: the first part is an array
  if (type?.kind === SCHEMA_KIND_ARRAY)
    return { sourceName: parts[0], direct: parts.length === 1 };

  for (let i = 1; i < parts.length; i++) {
    type = type?.getAccessValueType(parts[i]);
    if (!type) break;
    if (type.kind === SCHEMA_KIND_ARRAY) {
      return { sourceName: parts.slice(0, i + 1).join('.'), direct: false };
    }
  }

  return undefined;
}

function _getExpValue(source: string, exps: Record<string, unknown>)
{
  if (!source) return undefined;
  const parts = splitString(source);
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
  const parts = splitString(path);
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
  generics?: GenericParameter[],
  genericParams?: INodeType[],
): Promise<string[] | undefined> {
  if (!(returnType?.kind === SCHEMA_KIND_STRUCT) || !lastExpReturn) return undefined;

  const lastExpType = await getNodeType(lastExpReturn, generics, genericParams) as ValueType | undefined;
  if (!lastExpType) return undefined;

  if (lastExpType.isAssignableTo(returnType)) return undefined;

  const fields = returnType.getAccessEntries();
  if (!fields.length) return undefined;
  return fields.map(f => f.value);
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
