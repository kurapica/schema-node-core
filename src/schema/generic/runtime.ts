// =============================================================================
// GenericType — placeholder for unresolved generic type parameters
// Mirrors C# SchemaNode.Core/Runtime/Type/GenericType.cs
// =============================================================================

import { ValueType } from "../value";

/** The generic type parameter placeholder */
export class GenericType extends ValueType {
  private _name: string;
  private _compatibles: ValueType[] = [];

  constructor(name: string, compatibles: ValueType[]) {
    super();
    this._name = name;
    this._compatibles = compatibles;
  }
  override get name(): string { return this._name; }
  override get kind(): string { return 'generic'; }

  override isAssignableTo(other: ValueType): boolean {
    return !this._compatibles?.length || this._compatibles.some(c => c.isAssignableTo(other));
  }
}
