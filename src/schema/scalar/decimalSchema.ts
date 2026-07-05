import { getMetaPropertiesForSchema, Meta } from '../../attribute/meta';
import { Relation } from '../../attribute/relation';
import { ForSchema, IProperty, NodeSchemaKind, OfSchema, Property, SchemaGenerator, SchemaKind, SchemaType, ValueSchemaKind, Visible } from '../../property';
import { RuntimeNodeType } from '../../property/core/RuntimeNodeType';
import { combineProperties, setProperty, setPropertyValue } from '../../property/propertyOwner';
import { saveSchema } from '../../runtime/schemaRuntime';
import { DecimalType } from '../../runtime/type';
import { NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_SCHEMA_DECIMAL, NS_SYSTEM_SCHEMA_DECIMAL_TYPE, NS_SYSTEM_SCHEMA_PROPERTY_CORE, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_DECIMAL, SCHEMA_KIND_PROPERTY } from '../../utility/constant';
import { NodeSchema } from '../nodeSchema';

/** The decimal schema */
export interface DecimalSchema {
  /** The base schema type  */
  base?: string
}

/** the date schema meta */
@Meta(SchemaKind, [SCHEMA_KIND_DECIMAL, SCHEMA_KIND_ORDER_DECIMAL])
@Meta(NodeSchemaKind, [SCHEMA_KIND_DECIMAL, SCHEMA_KIND_ORDER_DECIMAL])
@Meta(ValueSchemaKind, [SCHEMA_KIND_DECIMAL, SCHEMA_KIND_ORDER_DECIMAL])
@Meta(RuntimeNodeType, DecimalType)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_DECIMAL}.schema`)
@Meta(SchemaGenerator, generateDecimalSchema)
class DecimalSchemaMeta {
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_DECIMAL_TYPE)
  base?: string;
}

/** The date property for node schema */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.decimal`)
@Relation(Visible, NS_SYSTEM_LOGIC_EQ, '$kind', SCHEMA_KIND_DECIMAL)
export class DecimalProperty extends Property<DecimalSchema>
{
  combine(other: IProperty): boolean {
    const otherSchema = other.getValue<DecimalSchema>();
    if (!otherSchema) return false;
    const selfSchema = this.getValue<DecimalSchema>();
    if (!selfSchema)
    {
      this.setValue(otherSchema);
      return true;
    }
    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_DECIMAL);
    this.setValue(selfSchema);
    return true;
  }
}

/** Generate the date schema */
function generateDecimalSchema(namespace: string, name: string, ctor: Function)
{
  const nodeSchema : NodeSchema = { namespace, name, kind: SCHEMA_KIND_DECIMAL };
  const decimalSchema : DecimalSchema = {};

  getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => setProperty(nodeSchema, p));
  getMetaPropertiesForSchema(SCHEMA_KIND_DECIMAL, ctor).forEach(p => setProperty(decimalSchema, p));
  setPropertyValue(nodeSchema, DecimalProperty, decimalSchema);
  saveSchema(nodeSchema);
}