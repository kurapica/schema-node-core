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
import { FuncProperty, type FuncArg, type FuncExp, type FunctionSchema } from '../../schema/functionSchema';
import { ExpType } from '../../enum/expType';
import { getPropertiesBySchemaKind, getProperty } from '../../property/propertyOwner';
import { getNodeType } from '../schemaRuntime';
import { getSchemaProvider } from '../../schema/provider/schemaProvider';
import { isEmpty, useQueueQuery } from '../../utility/toolset';
import { Converter, IProperty, NoCache, ServerOnly } from '../../property';
import { SCHEMA_KIND_FUNCTION } from '../../utility/constant';

/** Track which function names must be called remotely (server-only). */
const serverCallOnly = new Set<string>();

/** Shared result cache for remote calls (keyed by token). */
const shareFuncCallResult = new Map<string, unknown>();

/** Pending remote call queues to avoid duplicate concurrent calls. */
const pendingCall: Record<string, { resolve: (v: unknown) => void; reject: (e: unknown) => void }[]> = {};

/** Queue remote callFunction through useQueueQuery to serialize requests. */
const callSchemaFunctionQueue = useQueueQuery(
  (schemaName: string, args: unknown[], retType?: string) =>
    getSchemaProvider()!.callFunction(schemaName, args, retType),
);

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

  /** Don't cache results. */
  private nocache = false;

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

    // Resolve all exp functions
    if (this._funcSchema.exps?.length)
    {
      this._funcMap = new Map<string, FunctionType>();
      for(let i = 0; i < this._funcSchema.exps.length; i++)
      {
        const expName = this._funcSchema.exps[i].name?.toLowerCase();
        if (isEmpty(expName) || this._funcMap.has(expName)) continue;
        const funcType = await getNodeType(expName);
        if (funcType instanceof FunctionType)
        {
          this._funcMap.set(expName, funcType);
          if (funcType._serverOnly) this._serverOnly = true;
          if (funcType._noCache) this._noCache = true;
        }
        else
        {
          console.error(`Ths ${expName} is not a valid function schema.`)
        }
      }
    }
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
    // 1. System function — direct invocation
    if (this._systemFn && !this.isRemote)
      return this._callSystem(args);

    if (!this._built)
      this._buildComposite();

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
      if (pendingCall[token]) {
        return new Promise((resolve, reject) =>
          pendingCall[token].push({ resolve, reject }),
        );
      }

      pendingCall[token] = [];
      try {
        const res = await callSchemaFunctionQueue(schemaName, args);
        if (!this.nocache) shareFuncCallResult.set(token, res);
        pendingCall[token].forEach(c => c.resolve(res));
        return res;
      } catch (ex) {
        pendingCall[token].forEach(c => c.reject(ex));
        throw ex;
      } finally {
        delete pendingCall[token];
      }
    }

    // Complex args — no caching, just queue
    return callSchemaFunctionQueue(schemaName, args);
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
      this._needsRemote = true;
    }
  }

  /** Recursively compile expressions into an executable function. */
  private async _compileExpressions(
    exps: FuncExp[],
    args: FuncArg[],
  ): Promise<(...callArgs: unknown[]) => unknown> {
    const argNames = args.map(a => a.name);

    // Build sub-expression functions
    const expFunctions = new Map<string, Function>();
    for (const exp of exps) {
      const expFn = await this._resolveExpFunction(exp);
      if (!expFn) throw new Error(`Cannot resolve expression function: ${exp.func}`);
      expFunctions.set(exp.name, expFn);
    }

    return async (...callArgs: unknown[]): Promise<unknown> => {
      const expValues: Record<string, unknown> = {};
      for (let i = 0; i < argNames.length; i++) {
        expValues[argNames[i]] = callArgs[i];
      }

      for (const exp of exps) {
        const fn = expFunctions.get(exp.name)!;
        expValues[exp.name] = await this._executeExpression(fn, exp, expValues);
      }

      // Return the last expression's result
      return expValues[exps[exps.length - 1].name];
    };
  }

  /** Resolve a function reference from an expression. */
  private async _resolveExpFunction(exp: FuncExp): Promise<Function | undefined> {
    // Try system function first (locally registered)
    const funcType = await getNodeType(exp.func, this.generics, this.genericParams) as FunctionType | undefined;
    if (!funcType) return undefined;

    if (funcType._systemFn) return funcType._systemFn as Function;
    if (serverCallOnly.has(funcType.name)) {
      this._needsRemote = true;
      return undefined;
    }

    // Try building recursively
    if (!funcType._built) await funcType._buildComposite();
    if (funcType._compositeFn) return funcType._compositeFn;

    // Must be server-side
    serverCallOnly.add(funcType.name);
    this._needsRemote = true;
    return undefined;
  }

  /** Execute a single expression against current values. */
  private async _executeExpression(
    fn: Function,
    exp: FuncExp,
    expValues: Record<string, unknown>,
  ): Promise<unknown> {
    // Resolve arguments
    const val: unknown[] = [];
    if (exp.args) {
      for (const arg of exp.args) {
        val.push(arg.source ? expValues[arg.source] : arg.value);
      }
    }

    // Direct call
    if (exp.type === ExpType.Call) {
      return fn(...val);
    }

    // Array-operator expressions: find the array source argument
    const arrayIdx = val.findIndex(v => Array.isArray(v));
    const sourceArray = arrayIdx >= 0 ? val[arrayIdx] as unknown[] : undefined;
    if (!sourceArray) return null;

    switch (exp.type) {
      case ExpType.Map:
        return Promise.all(sourceArray.map((elem) => {
          const mapped = [...val];
          if (arrayIdx >= 0) mapped[arrayIdx] = elem;
          return fn(...mapped);
        }));

      case ExpType.Filter:
        return (await Promise.all(sourceArray.map(async (elem) => {
          const filtered = [...val];
          if (arrayIdx >= 0) filtered[arrayIdx] = elem;
          return (await fn(...filtered)) ? elem : undefined;
        }))).filter(Boolean);

      case ExpType.Reduce: {
        let acc = val.length > 1 ? val[1] : sourceArray[0];
        const startIdx = acc !== val[1] ? 1 : 0;
        for (let j = startIdx; j < sourceArray.length; j++) {
          const reduced = [...val];
          if (arrayIdx >= 0 && arrayIdx < reduced.length) reduced[arrayIdx] = sourceArray[j];
          reduced[1] = acc;
          acc = await fn(...reduced);
        }
        return acc;
      }

      case ExpType.First:
        for (const elem of sourceArray) {
          const test = [...val];
          if (arrayIdx >= 0) test[arrayIdx] = elem;
          if (await fn(...test)) return elem;
        }
        return undefined;

      case ExpType.Last: {
        let last: unknown;
        for (const elem of sourceArray) {
          const test = [...val];
          if (arrayIdx >= 0) test[arrayIdx] = elem;
          if (await fn(...test)) last = elem;
        }
        return last;
      }

      case ExpType.Count: {
        let count = 0;
        for (const elem of sourceArray) {
          const test = [...val];
          if (arrayIdx >= 0) test[arrayIdx] = elem;
          if (await fn(...test)) count++;
        }
        return count;
      }

      case ExpType.All:
        for (const elem of sourceArray) {
          const test = [...val];
          if (arrayIdx >= 0) test[arrayIdx] = elem;
          if (!(await fn(...test))) return false;
        }
        return true;

      case ExpType.Any:
        for (const elem of sourceArray) {
          const test = [...val];
          if (arrayIdx >= 0) test[arrayIdx] = elem;
          if (await fn(...test)) return true;
        }
        return false;

      default:
        return fn(...val);
    }
  }
}
