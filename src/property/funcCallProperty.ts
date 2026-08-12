// =============================================================================
// FuncCallProperty & FuncCall — function-call valued properties
// Mirrors C# SchemaNode.Core/Property/FuncCallProperty.cs
// =============================================================================

import type { FuncCall } from '../schema/function/type';
import { Property } from './property';
import type { ITypeRefProperty } from './typeRefProperty';

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
