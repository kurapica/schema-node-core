// =============================================================================
// FuncCallProperty & FuncCall — function-call valued properties
// Mirrors C# SchemaNode.Core/Property/FuncCallProperty.cs
// =============================================================================

import { Meta } from '../attribute';
import { CallArg } from '../schema/functionSchema';
import { NODE_SELF, NS_SYSTEM_LIST, NS_SYSTEM_SCHEMA_FUNC_CALL_ARG, NS_SYSTEM_SCHEMA_FUNC_TYPE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_SCHEMA_REFLECT_FUNC_WITH_RETURN } from '../utility';
import { DisplayOnly, InVisible, ReadOnly } from './common';
import { Valid } from './constraint';
import { SchemaType } from './core';
import { Property } from './property';
import type { ITypeRefProperty } from './property';

/**
 * Represents a deferred function call: func(args...).
 */
export interface FuncCall {
  /** The return type of the function */
   return?: string;

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

@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY}.funccall`)
class FuncCallMeta implements FuncCall {
  /** The return type of the function */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(DisplayOnly, true)
  @Meta(InVisible, true)
  return?: string;

  /** Fully qualified function schema name. */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_FUNC_TYPE)
  @Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_FUNC_WITH_RETURN, NODE_SELF, '@return'))
  func!: string;

  /** Call arguments. */
  @Meta(SchemaType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_SCHEMA_FUNC_CALL_ARG}>`)
  args!: CallArg[];
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