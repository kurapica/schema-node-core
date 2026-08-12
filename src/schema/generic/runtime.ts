// =============================================================================
// GenericType — placeholder for unresolved generic type parameters
// Mirrors C# SchemaNode.Core/Runtime/Type/GenericType.cs
// =============================================================================

import { ValueType } from "../value";

/** The generic type parameter placeholder */
export class GenericType extends ValueType {
  private _name: string;

  constructor(name: string = '') {
    super();
    this._name = name;
  }
  override get name(): string { return this._name; }
  override get kind(): string { return 'generic'; }
}
