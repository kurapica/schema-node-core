// =============================================================================
// GenericType — placeholder for unresolved generic type parameters
// Mirrors C# SchemaNode.Core/Runtime/Type/GenericType.cs
// =============================================================================

import { ValueType } from './valueType';
import { AnyNode } from '../../node/scalarNode';
import { IPropertyProvider, IValueAccess } from '../interfaces';

export class GenericType extends ValueType {
  private _name: string;

  constructor(name: string = '') {
    super();
    this._name = name;
  }

  override get name(): string { return this._name; }

  override create(value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider): AnyNode { return new AnyNode(this, value, parent, propProvider); }
}
