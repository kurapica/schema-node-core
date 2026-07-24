// =============================================================================
// FuncCallProperty & FuncCall — function-call valued properties
// Mirrors C# SchemaNode.Core/Property/FuncCallProperty.cs
// =============================================================================

import { CallArg } from '../schema/functionSchema';
import { Property } from './property';
import type { ITypeRefProperty } from './property';

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
export abstract class FuncCallProperty extends Property<FuncCall> implements ITypeRefProperty {
  /** Return the referenced function type name for type-reference resolution. */
  *getRefTypes(): Generator<string> {
    if (this._value?.func)
      yield this._value.func;
  }
}

/** build the function call for simple */
export function buildFuncCall(func: string, ...args: unknown[]): FuncCall
{
  return {
    func,
    args: args.map(a => {
      if (typeof(a) === 'string')
      {
        if (a.startsWith('@'))
        {
          if (a.startsWith('@@'))
            return { value: a.substring(1) }
          return { source: a.substring(1) }
        }
        else if (a.startsWith('$'))
        {
          if (a.startsWith('$$'))
            return { value: a.substring(1) }
          return { source: a }
        }
      }
      return { value: a }
    })
  }
}