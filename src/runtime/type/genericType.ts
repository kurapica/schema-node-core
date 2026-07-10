// =============================================================================
// GenericType — placeholder for unresolved generic type parameters
// Mirrors C# SchemaNode.Core/Runtime/Type/GenericType.cs
// =============================================================================

import { ValueType } from './valueType';
import { AnyNode } from '../../node/scalarNode';

export class GenericType extends ValueType {
  private _name: string;

  constructor(name: string = '') {
    super();
    this._name = name;
  }

  override get name(): string { return this._name || super.name; }

  set name(val: string) { this._name = val; }

  override create(): AnyNode {
    return new AnyNode(this);
  }
}
