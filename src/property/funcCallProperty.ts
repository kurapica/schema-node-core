// =============================================================================
// FuncCallProperty & FuncCall — function-call valued properties
// Mirrors C# SchemaNode.Core/Property/FuncCallProperty.cs
// =============================================================================

import { Property } from './property';
import type { IProperty } from './property';

/**
 * A single argument in a function call.
 * If prefixed with '$', value is a source reference path.
 */
export interface CallArg {
  /** The argument value, or a source path (starting with $). */
  value: unknown;
}

/**
 * Represents a deferred function call: func(args...).
 */
export interface FuncCall {
  /** Fully qualified function schema name. */
  func: string;
  /** Call arguments. */
  args: CallArg[];
}

/**
 * Property whose value is a FuncCall.
 * Implements ITypeRefProperty since the function name is a type reference.
 * Parses string/$-prefixed args in setValue().
 */
export abstract class FuncCallProperty extends Property<FuncCall> {
  /** Return the referenced function type name for type-reference resolution. */
  getRefTypes(): string[] {
    return this._hasValue && this._value ? [this._value.func] : [];
  }

  override setValue<TValue>(value: TValue): void {
    if (typeof value === 'string') {
      // Single string → func name with no args
      this._value = { func: value, args: [] };
      this._hasValue = true;
    } else if (Array.isArray(value)) {
      const [func, ...rawArgs] = value as unknown[];
      const args: CallArg[] = rawArgs.map((a) => ({
        value: a,
      }));
      this._value = { func: String(func ?? ''), args };
      this._hasValue = true;
    } else if (typeof value === 'object' && value !== null) {
      const v = value as unknown as FuncCall;
      this._value = { func: v.func, args: v.args ?? [] };
      this._hasValue = true;
    } else {
      super.setValue(value);
    }
  }
}

// Marker check helper
export function _isTypeRefProperty(prop: IProperty): boolean {
  return typeof (prop as FuncCallProperty).getRefTypes === 'function';
}
