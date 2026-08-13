// =============================================================================
// PropertyType — runtime type for property schemas
// =============================================================================

import { getPropertiesBySchemaKind, getPropertyValue } from '../../property/propertyOwner';
import { getNodeType } from '../../runtime/context';
import { NodeType } from '../node/runtime';
import { ValueType } from '../value/runtime';

import type { INodeType, IProperty } from '../../interface';
import type { PropertySchema } from './type';

import { SCHEMA_KIND_PROPERTY } from '../../utility/constant';

export class PropertyType extends NodeType {
  private _propertySchema: PropertySchema | undefined
  private _valueType: ValueType | undefined

  /** The property type property name */
  get property() { return this._propertySchema?.property; }

  /** the property value type */
  get valueType(): ValueType | undefined { return this._valueType; }

  /** The property works for schema kind */
  get forSchemas(): string[] | undefined { return this._propertySchema?.forSchemas ? [...this._propertySchema.forSchemas] : []; }

  override loadProperties(): IProperty[] {
    this._propertySchema = getPropertyValue<PropertySchema>(this.schema, "property");
    return this._propertySchema ? Array.from(getPropertiesBySchemaKind(this._propertySchema, SCHEMA_KIND_PROPERTY)) : [];
  }

  override async load() {
    this._valueType = this._propertySchema?.type
      ? await getNodeType(this._propertySchema.type) as ValueType
      : undefined;
  }

  override *getRefTypes(): Generator<INodeType> {
    if (this._valueType)
      yield this._valueType;
    yield* super.getRefTypes();
  }
}