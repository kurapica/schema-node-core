import { getMetaProperty, Meta } from '../../attribute/meta';
import { Attach } from '../../property/core/attach';
import { Display } from '../../property/common/display';
import { NodeSchemaKind } from '../../property/record/nodeSchemaKind';
import { OfSchema } from '../../property/core/ofSchema';
import { SchemaGenerator } from '../../property/core/schemaGenerator';
import { SchemaKind } from '../../property/record/schemaKind';
import { SchemaType } from '../../property/core/schemaType';
import { Valid } from '../../property/constraint/valid';
import { ValueSchemaKind } from '../../property/record/valueSchemaKind';
import { Base } from '../../property/core/base';
import { RuntimeNodeType } from '../../property/core/runtimeNodeType';
import { buildFuncCall } from '../../schema/function/type';
import { setProperty, setPropertyValue } from '../../property/propertyOwner';
import { getMetaPropertiesForSchema, saveNodeSchema } from '../../runtime/schemaRuntime';
import { combinePaths } from '../../utility/toolset';
import { StringProperty } from './property';
import { StringType } from './runtime';
import { StringValue } from './valid';
import { DataNodeType } from '../../property/core/dataNodeType';
import { StringNode } from './node';

import type { NodeSchema } from '../node/type';
import type { StringSchema } from './type';

import { NS_SYSTEM_SCHEMA_STRING_TYPE, SCHEMA_KIND_STRING, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_STRING, NS_SYSTEM_SCHEMA_STRING, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NODE_SELF, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND } from '../../utility/constant';

/** The string schema kind. */
@Meta(SchemaKind, [SCHEMA_KIND_STRING, SCHEMA_KIND_ORDER_STRING])
@Meta(NodeSchemaKind, [SCHEMA_KIND_STRING, SCHEMA_KIND_ORDER_STRING])
@Meta(ValueSchemaKind, [SCHEMA_KIND_STRING, SCHEMA_KIND_ORDER_STRING])
@Meta(RuntimeNodeType, StringType)
@Meta(SchemaGenerator, generateStringSchema)
@Meta(StringValue)
@Meta(DataNodeType, StringNode)
class StringKind {}

/** the date schema meta */
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRING}.schema`)
@Meta(Attach, SCHEMA_KIND_STRING)
class StringSchemaMeta {
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_STRING_TYPE)
  base?: string;
}

/** Represents the string value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_STRING_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, false, SCHEMA_KIND_STRING))
class StringTypeMeta {}

/** Generate the date schema */
function generateStringSchema(namespace: string, name: string, ctor: Function)
{
  const nodeSchema : NodeSchema = { namespace, name, kind: SCHEMA_KIND_STRING };
  const stringSchema : StringSchema = { base : getMetaProperty(ctor, Base)?.getValue<string>() ?? undefined };

  setPropertyValue(nodeSchema, Display, { key: combinePaths(namespace, name) });
  getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => setProperty(nodeSchema, p));
  getMetaPropertiesForSchema(SCHEMA_KIND_STRING, ctor).forEach(p => setProperty(stringSchema, p));
  setPropertyValue(nodeSchema, StringProperty, stringSchema);
  saveNodeSchema(nodeSchema);
}