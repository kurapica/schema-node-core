// =============================================================================
// ScalarType — abstract base for scalar runtime types
// Mirrors C# SchemaNode.Core/Runtime/Type/ScalarType.cs
// =============================================================================

import { IProperty } from '../../property/property';
import { joinProperties } from "../interfaces";
import { filterSchemaKindProperties, getSchemaKindProperties, getSchemaKindProperty } from "../schemaRuntime";
import { NodeType } from "./nodeType";
import { ValueType } from "./valueType";

export abstract class ScalarType extends ValueType {
  /** Base type for scalar inheritance. */
  private _baseType?: ScalarType;

  /** Base type for scalar inheritance. */
  get baseType(): ScalarType | undefined { return this._baseType; }

  /** Base type for scalar inheritance. */
  protected set baseType(value: ScalarType | undefined) { this._baseType = value; }

  override isAssignableTo(other: ValueType): boolean {
    return this.kind.toLowerCase() === other.kind.toLowerCase() || super.isAssignableTo(other);
  }

  override *getRefTypes(): Generator<NodeType> {
    if (this._baseType)
      yield this._baseType;
    yield* super.getRefTypes();
  }

  override getProperty<T extends IProperty>(propCtor: new () => T): T | undefined {
    return super.getProperty(propCtor) ?? (this._baseType ? this._baseType.getProperty(propCtor) : getSchemaKindProperty(this.kind, propCtor));
  }

  override *getProperties<T extends IProperty>(propCtor: new () => T): Generator<T> {
    // self -> base -> prototype
    return joinProperties(super.getProperties(propCtor), (this._baseType ? this._baseType.getProperties(propCtor) : getSchemaKindProperties(this.kind, propCtor)));
  }

  override filterProperties(predicate: (prop: IProperty) => boolean): Generator<IProperty> {
    return joinProperties(super.filterProperties(predicate), (this._baseType ? this._baseType.filterProperties(predicate) : filterSchemaKindProperties(this.kind, predicate)));
  }
}
