import { getMetaPropertiesForSchema, getMetaProperty, Meta } from '../../attribute/meta';
import { Relation } from '../../attribute/relation';
import { Attach, Display, ForSchema, IProperty, NodeSchemaKind, OfSchema, Property, PropertyValueType, SchemaGenerator, SchemaKind, SchemaType, Valid, ValueSchemaKind, Visible } from '../../property';
import { StringValue } from '../../property/constraint/stringValue';
import { Base } from '../../property/core/base';
import { RuntimeNodeType } from '../../property/core/runtimeNodeType';
import { buildFuncCall } from '../../property/funcCallProperty';
import { combineProperties, setProperty, setPropertyValue } from '../../property/propertyOwner';
import { Call } from '../../relation/call';
import { saveNodeSchema } from '../../runtime/schemaRuntime';
import { StringType } from '../../runtime/type';
import { NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_SCHEMA_STRING_TYPE, NS_SYSTEM_SCHEMA_PROPERTY_CORE, SCHEMA_KIND_STRING, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_STRING, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_STRING, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NODE_SELF, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND } from '../../utility/constant';
import { combinePaths } from '../../utility/toolset';
import { NodeSchema } from '../nodeSchema';

/** The decimal schema */
export interface StringSchema {
  /** The base schema type  */
  base?: string
}

/** the date schema meta */
@Meta(SchemaKind, [SCHEMA_KIND_STRING, SCHEMA_KIND_ORDER_STRING])
@Meta(NodeSchemaKind, [SCHEMA_KIND_STRING, SCHEMA_KIND_ORDER_STRING])
@Meta(ValueSchemaKind, [SCHEMA_KIND_STRING, SCHEMA_KIND_ORDER_STRING])
@Meta(RuntimeNodeType, StringType)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRING}.schema`)
@Meta(Attach, SCHEMA_KIND_STRING)
@Meta(SchemaGenerator, generateStringSchema)
@Meta(StringValue)
class StringSchemaMeta {
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_STRING_TYPE)
  base?: string;
}

/** The date property for node schema */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.string`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_STRING}.schema`)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', SCHEMA_KIND_STRING))
export class StringProperty extends Property<StringSchema>
{
  combine(other: IProperty): boolean {
    const otherSchema = other.getValue<StringSchema>();
    if (!otherSchema) return false;
    const selfSchema = this.getValue<StringSchema>();
    if (!selfSchema)
    {
      this.setValue(otherSchema);
      return true;
    }
    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_STRING);
    this.setValue(selfSchema);
    return true;
  }
}

/** Represents the string value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_STRING_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, SCHEMA_KIND_STRING))
class StringTypeMeta {}

/** Generate the date schema */
function generateStringSchema(namespace: string, name: string, ctor: Function)
{
  const nodeSchema : NodeSchema = { namespace, name, kind: SCHEMA_KIND_STRING };
  const StringSchema : StringSchema = { base : getMetaProperty(ctor, Base)?.getValue<string>() ?? undefined };

  setPropertyValue(nodeSchema, Display, { key: combinePaths(namespace, name) });
  getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => setProperty(nodeSchema, p));
  getMetaPropertiesForSchema(SCHEMA_KIND_STRING, ctor).forEach(p => setProperty(StringSchema, p));
  setPropertyValue(nodeSchema, StringProperty, StringSchema);
  saveNodeSchema(nodeSchema);
}