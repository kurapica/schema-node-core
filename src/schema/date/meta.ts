import { getMetaProperty, Meta } from '../../attribute/meta';
import { Attach } from '../../property/core/attach';
import { Display } from '../../property/common/display';
import { NodeSchemaKind } from '../../property/record/nodeSchemaKind';
import { OfSchema } from '../../property/core/ofSchema';
import { SchemaGenerator } from '../../property/core/schemaGenerator';
import { SchemaKind } from '../../property/record/schemaKind';
import { SchemaType } from '../../property/core/schemaType';
import { Valid } from '../../property/common/valid';
import { ValueSchemaKind } from '../../property/record/valueSchemaKind';
import { Base } from '../../property/core/base';
import { RuntimeNodeType } from '../../property/core/runtimeNodeType';
import { buildFuncCall } from '../../schema/function/type';
import { getMetaPropertiesForSchema, saveNodeSchema } from '../../runtime/schemaRuntime';
import { combinePaths } from '../../utility/toolset';
import { setProperty, setPropertyValue } from '../../property/propertyOwner';
import { DateProperty } from './date';
import { DateType } from './runtime';
import { DateValue } from './property/dateValue';
import { DataNodeType } from '../../property/core/dataNodeType';
import { DateNode } from './node';

import type { NodeSchema } from '../node/type';
import type { DateSchema } from './type';

import { NODE_SELF, NS_SYSTEM_INTRINSIC, NS_SYSTEM_SCHEMA_DATE, NS_SYSTEM_SCHEMA_DATE_TYPE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_DATE, SCHEMA_KIND_DATE_DEFINE, SCHEMA_KIND_DATE_USAGE, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_DATE, SCHEMA_KIND_STRING } from '../../utility/constant';
import { SchemaUsage } from '../../property/core/schemaUsage';
import { Append, AsSuggest, BlackList, Default, WhiteList } from '../../property';
import { Relation } from '../../attribute/relation';

/** The date schema kind. */
@Meta(SchemaKind, [SCHEMA_KIND_DATE, SCHEMA_KIND_ORDER_DATE])
@Meta(NodeSchemaKind, [SCHEMA_KIND_DATE, SCHEMA_KIND_ORDER_DATE])
@Meta(ValueSchemaKind, [SCHEMA_KIND_DATE, SCHEMA_KIND_ORDER_DATE])
@Meta(RuntimeNodeType, DateType)
@Meta(SchemaGenerator, generateDateSchema)
@Meta(SchemaUsage, `${NS_SYSTEM_SCHEMA_DATE}.usage`)
@Meta(Append, [AsSuggest, Default, BlackList, WhiteList, Error, Valid])
@Meta(DateValue)
@Meta(DataNodeType, DateNode)
class DateKind {}

/** The date schema meta. */
@Meta(SchemaKind, [SCHEMA_KIND_DATE_DEFINE, SCHEMA_KIND_ORDER_DATE])
@Meta(Append, [Error, Valid])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_DATE}.schema`)
@Meta(Attach, SCHEMA_KIND_DATE_DEFINE)
class DateSchemaMeta implements DateSchema {
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_DATE_TYPE)
  base?: string;
}

/** The date schema usage. */
@Meta(SchemaKind, [SCHEMA_KIND_DATE_USAGE, SCHEMA_KIND_ORDER_DATE])
@Meta(Append, [AsSuggest, Default, BlackList, WhiteList, Error, Valid])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_DATE}.usage`)
@Meta(Attach, SCHEMA_KIND_DATE_USAGE)
@Relation(`${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.whitelist`,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@whiteList'), 'default')
@Relation(`${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.blacklist`,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@blackList'), 'default')
class DateUsage {}

/** Represents the date value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_DATE_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, false, SCHEMA_KIND_DATE))
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