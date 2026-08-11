import { getMetaPropertiesForSchema, getMetaProperty, Meta } from '../../attribute/meta';
import { Attach } from '../../property/core/attach';
import { Display } from '../../property/common/display';
import { NodeSchemaKind } from '../../property/record/nodeSchemaKind';
import { OfSchema } from '../../property/core/ofSchema';
import { SchemaGenerator } from '../../property/core/schemaGenerator';
import { SchemaKind } from '../../property/record/schemaKind';
import { SchemaType } from '../../property/core/schemaType';
import { Valid } from '../../property/constraint/valid';
import { ValueSchemaKind } from '../../property/record/valueSchemaKind';
import { StringValue } from '../../property/constraint/stringValue';
import { Base } from '../../property/core/base';
import { RuntimeNodeType } from '../../property/core/runtimeNodeType';
import { buildFuncCall } from '../../property/funcCallProperty';
import { setProperty, setPropertyValue } from '../../property/propertyOwner';
import { saveNodeSchema } from '../../runtime/schemaRuntime';
import { StringType } from '../../runtime/type/scalar/stringType';
import { NS_SYSTEM_SCHEMA_STRING_TYPE, SCHEMA_KIND_STRING, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_STRING, NS_SYSTEM_SCHEMA_STRING, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NODE_SELF, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND } from '../../utility/constant';
import { combinePaths } from '../../utility/toolset';

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