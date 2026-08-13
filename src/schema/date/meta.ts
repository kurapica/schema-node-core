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
import { getMetaPropertiesForSchema, saveNodeSchema } from '../../runtime/schemaRuntime';
import { combinePaths } from '../../utility/toolset';
import { setProperty, setPropertyValue } from '../../property/propertyOwner';
import { DateProperty } from './property';
import { DateType } from './runtime';
import { DateValue } from './valid';
import { DataNodeType } from '../../property';
import { DateNode } from './node';

import type { NodeSchema } from '../node/type';
import type { DateSchema } from './type';

import { NODE_SELF, NS_SYSTEM_SCHEMA_DATE, NS_SYSTEM_SCHEMA_DATE_TYPE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_DATE, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_DATE, SCHEMA_KIND_STRING } from '../../utility/constant';

/** the date schema meta */
@Meta(SchemaKind, [SCHEMA_KIND_DATE, SCHEMA_KIND_ORDER_DATE])
@Meta(NodeSchemaKind, [SCHEMA_KIND_DATE, SCHEMA_KIND_ORDER_DATE])
@Meta(ValueSchemaKind, [SCHEMA_KIND_DATE, SCHEMA_KIND_ORDER_DATE])
@Meta(RuntimeNodeType, DateType)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_DATE}.schema`)
@Meta(SchemaGenerator, generateDateSchema)
@Meta(Attach, SCHEMA_KIND_DATE)
@Meta(DateValue)
@Meta(DataNodeType, DateNode)
class DateSchemaMeta {
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_DATE_TYPE)
  base?: string;
}

/** Represents the date value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_DATE_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, SCHEMA_KIND_DATE))
class DateTypeMeta {}

/** Generate the date schema */
function generateDateSchema(namespace: string, name: string, ctor: Function)
{
  const nodeSchema : NodeSchema = { namespace, name, kind: SCHEMA_KIND_DATE };
  const dateSchema : DateSchema = { base : getMetaProperty(ctor, Base)?.getValue<string>() ?? undefined };

  setPropertyValue(nodeSchema, Display, { key: combinePaths(namespace, name) });
  getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => setProperty(nodeSchema, p));
  getMetaPropertiesForSchema(SCHEMA_KIND_DATE, ctor).forEach(p => setProperty(dateSchema, p));
  setPropertyValue(nodeSchema, DateProperty, dateSchema);
  saveNodeSchema(nodeSchema);
}