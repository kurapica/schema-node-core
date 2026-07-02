// =============================================================================
// FunctionType — runtime type for function schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/FunctionType.cs
//
// Interpretive execution (no CompileContext): calls stored function directly.
// For system functions: fn is stored in schema.extensions._fn
// For composite functions: walks the expression tree (exps)
// =============================================================================

import { NodeType } from './nodeType';
import type { NodeSchema } from '../../schema/nodeSchema';
import type { ValueType } from './valueType';
import type { FunctionArgumentInfo, FunctionExpression } from '../../schema/functionSchema';

export class FunctionType extends NodeType {
  /** Return value type (resolved at load time). */
  returnType?: ValueType;

  /** Argument definitions. */
  args: FunctionArgumentInfo[] = [];

  /** Expression tree (for composite functions). */
  exps: FunctionExpression[] = [];

  /** Whether this is a server-side-only call. */
  server = false;

  /** Don't cache results. */
  nocache = false;

  /** The raw JS function for system calls. */
  private _systemFn?: (...args: unknown[]) => unknown;

  constructor(schema: NodeSchema, genericParams?: NodeType[]) {
    super(schema, genericParams);
    this.args = (schema.extensions?.['func'] as FunctionSchemaData)?.args ?? [];
    this.exps = (schema.extensions?.['func'] as FunctionSchemaData)?.exps ?? [];
    this.server = (schema.extensions?.['func'] as FunctionSchemaData)?.server ?? false;
    this.nocache = (schema.extensions?.['func'] as FunctionSchemaData)?.nocache ?? false;
    this._systemFn = schema.extensions?.['_fn'] as ((...args: unknown[]) => unknown) | undefined;
  }

  // ── Interpretive execution ─────────────────────────────────────────────

  /**
   * Call this function with the given arguments.
   * For system functions: invokes the stored JS function directly.
   * For composite functions: walks the expression tree (TODO).
   */
  call(args: unknown[]): unknown {
    if (this._systemFn) {
      return this._systemFn(...args);
    }
    if (this.exps.length > 0) {
      return this._callComposite(args);
    }
    return undefined;
  }

  /** Execute composite function by walking the expression tree. */
  private _callComposite(args: unknown[]): unknown {
    let result: unknown = undefined;
    for (const exp of this.exps) {
      switch (exp.type) {
        case 'call':
          if (exp.func) {
            // Recursive call to other function — resolved by runtime context
            result = undefined; // TODO: resolve func → FunctionType → call()
          }
          break;
        case 'map':
          if (Array.isArray(args[0]) && exp.func) {
            result = (args[0] as unknown[]).map((item) => undefined /* TODO */);
          }
          break;
        case 'filter':
          if (Array.isArray(args[0]) && exp.func) {
            result = (args[0] as unknown[]).filter((item) => undefined /* TODO */);
          }
          break;
        case 'reduce':
          if (Array.isArray(args[0]) && exp.func) {
            result = (args[0] as unknown[]).reduce((acc, item) => undefined /* TODO */);
          }
          break;
        case 'count':
          result = Array.isArray(args[0]) ? (args[0] as unknown[]).length : 0;
          break;
        case 'first':
          result = Array.isArray(args[0]) ? (args[0] as unknown[])[0] : undefined;
          break;
        case 'last':
          result = Array.isArray(args[0]) ? (args[0] as unknown[])[(args[0] as unknown[]).length - 1] : undefined;
          break;
        case 'all':
          result = Array.isArray(args[0]) ? (args[0] as unknown[]).every((item) => !!item) : false;
          break;
        case 'any':
          result = Array.isArray(args[0]) ? (args[0] as unknown[]).some((item) => !!item) : false;
          break;
      }
    }
    return result;
  }

  /** Check if this is a converter function. */
  get isConverter(): boolean {
    return (this.schema.extensions?.['func'] as FunctionSchemaData)?.converter ?? false;
  }
}

// Local type for func extension data shape
interface FunctionSchemaData {
  return?: string;
  args?: FunctionArgumentInfo[];
  exps?: FunctionExpression[];
  converter?: boolean;
  server?: boolean;
  nocache?: boolean;
}
