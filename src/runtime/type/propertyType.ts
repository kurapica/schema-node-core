// =============================================================================
// PropertyType — runtime type for property schemas
// =============================================================================

import { NodeType } from './nodeType';
import { PropertyProperty, PropertySchema } from '../../schema/propertySchema';
import { IProperty } from '../../property';
import { getPropertiesBySchemaKind, getProperty } from '../../property/propertyOwner';
import { SCHEMA_KIND_PROPERTY } from '../../utility/constant';
import { ValueType } from '.';
import { getNodeType } from '../schemaRuntime';

export class PropertyType extends NodeType {
  private _propertySchema: PropertySchema | undefined
  private _valueType: ValueType | undefined

  /** The property type property name */
  get property() { return this._propertySchema?.property; }

  /** the property value type */
  get valueType(): ValueType | undefined { return this._valueType; }

  override loadProperties(): IProperty[] {
    this._propertySchema = getProperty(this.schema, PropertyProperty)?.getValue();
    return this._propertySchema ? getPropertiesBySchemaKind(this._propertySchema, SCHEMA_KIND_PROPERTY) : [];
  }

  override async load() {
    this._valueType = this._propertySchema?.type
      ? await getNodeType(this._propertySchema.type) as ValueType
      : undefined;
  }

  override *getRefTypes(): Generator<NodeType> {
    if (this._valueType)
      yield this._valueType;
    for(const type of super.getRefTypes())
      yield type;
  }
}