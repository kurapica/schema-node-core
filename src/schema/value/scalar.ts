// =============================================================================
// ScalarType — abstract base for scalar runtime types
// Mirrors C# SchemaNode.Core/Runtime/Type/ScalarType.cs
// =============================================================================

import { joinProperties } from '../../interface';
import { filterSchemaKindProperties, getSchemaKindProperties, getSchemaKindProperty } from '../../runtime/schemaRuntime';
import { ValueType } from './runtime';

import type { INodeType, IProperty, PropertyCtor } from '../../interface';

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

  override *getRefTypes(): Generator<INodeType> {
    if (this._baseType)
      yield this._baseType;
    yield* super.getRefTypes();
  }

  override getProperty<T extends IProperty>(propCtor: PropertyCtor | string): T | undefined {
    return super.getProperty(propCtor) ?? (this._baseType ? this._baseType.getProperty(propCtor) : getSchemaKindProperty(this.kind, propCtor));
  }

  override *getProperties<T extends IProperty>(propCtor: PropertyCtor | string): Generator<T> {
    // self -> base -> prototype
    for (let prop of joinProperties(super.getProperties(propCtor), (this._baseType ? this._baseType.getProperties(propCtor) : getSchemaKindProperties(this.kind, propCtor)))) yield prop as T;
  }

  override *filterProperties(predicate: (prop: IProperty) => boolean): Generator<IProperty> {
    for (let prop of joinProperties(super.filterProperties(predicate), (this._baseType ? this._baseType.filterProperties(predicate) : filterSchemaKindProperties(this.kind, predicate)))) yield prop;
  }
}
