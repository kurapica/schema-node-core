import { getMetaPropertiesForSchema, getMetaProperty, Meta } from '../../attribute/meta';
import { Relation } from '../../attribute/relation';
import { Display, ForSchema, IProperty, NodeSchemaKind, OfSchema, Property, PropertyValueType, SchemaGenerator, SchemaKind, SchemaType, Valid, ValueSchemaKind, Visible } from '../../property';
import { Base } from '../../property/core/base';
import { RuntimeNodeType } from '../../property/core/RuntimeNodeType';
import { buildFuncCall } from '../../property/funcCallProperty';
import { combineProperties, setProperty, setPropertyValue } from '../../property/propertyOwner';
import { Call } from '../../relation/call';
import { saveSystemSchema } from '../../runtime/schemaRuntime';
import { DecimalType } from '../../runtime/type';
import { NODE_SELF, NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_SCHEMA_DECIMAL, NS_SYSTEM_SCHEMA_DECIMAL_TYPE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_DECIMAL, SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRING } from '../../utility/constant';
import { combinePaths } from '../../utility/toolset';
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
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_DECIMAL}.schema`)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', SCHEMA_KIND_DECIMAL))
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

/** Represents the decimal value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_DECIMAL_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, { func: NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, args: [ { source: NODE_SELF }, { value: SCHEMA_KIND_DECIMAL }] } )
class DecimalTypeMeta {}

/** Generate the date schema */
function generateDecimalSchema(namespace: string, name: string, ctor: Function)
{
  const nodeSchema : NodeSchema = { namespace, name, kind: SCHEMA_KIND_DECIMAL };
  const decimalSchema : DecimalSchema = { base : getMetaProperty(ctor, Base)?.getValue<string>() ?? undefined };

  setPropertyValue(nodeSchema, Display, { key: combinePaths(namespace, name) });
  getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => setProperty(nodeSchema, p));
  getMetaPropertiesForSchema(SCHEMA_KIND_DECIMAL, ctor).forEach(p => setProperty(decimalSchema, p));
  setPropertyValue(nodeSchema, DecimalProperty, decimalSchema);
  saveSystemSchema(nodeSchema);
}