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
import { setProperty, setPropertyValue } from '../../property/propertyOwner';
import { getMetaPropertiesForSchema, saveNodeSchema } from '../../runtime/schemaRuntime';
import { combinePaths } from '../../utility/toolset';
import { StringProperty } from './string';
import { StringType } from './runtime';
import { StringValue } from './property/stringValue';
import { DataNodeType } from '../../property/core/dataNodeType';
import { StringNode } from './node';
import { SchemaUsage } from '../../property/core/schemaUsage';
import { Append } from '../../property/core/append';
import { EntrySource } from '../../property/core/entrySource';
import { AsSuggest } from '../../property/common/asSuggest';
import { Default } from '../../property/common/default';
import { BlackList } from '../../property/common/blackList';
import { WhiteList } from '../../property/common/whiteList';
import { Root } from '../enum/property/root';
import { LeafOnly } from '../enum/property/leafOnly';
import { Unit } from '../../property/common/unit';

import type { NodeSchema } from '../node/type';
import type { StringSchema } from './type';

import { NS_SYSTEM_SCHEMA_STRING_TYPE, SCHEMA_KIND_STRING, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_STRING, NS_SYSTEM_SCHEMA_STRING, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NODE_SELF, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_STRING_DEFINE, SCHEMA_KIND_STRING_USAGE, NS_SYSTEM_INTRINSIC, NS_SYSTEM_SCHEMA_REFLECT_ENUM, NODE_TYPE } from '../../utility/constant';
import { Relation } from '../../attribute/relation';
import { Visible } from '../../property/common/visible';
import { OverrideType } from '../../property/core/overrideType';
import { JsRegex } from '../../property';

/** The string schema kind. */
@Meta(SchemaKind, [SCHEMA_KIND_STRING, SCHEMA_KIND_ORDER_STRING])
@Meta(NodeSchemaKind, [SCHEMA_KIND_STRING, SCHEMA_KIND_ORDER_STRING])
@Meta(ValueSchemaKind, [SCHEMA_KIND_STRING, SCHEMA_KIND_ORDER_STRING])
@Meta(RuntimeNodeType, StringType)
@Meta(SchemaGenerator, generateStringSchema)
@Meta(SchemaUsage, `${NS_SYSTEM_SCHEMA_STRING}.usage`)
@Meta(Append, [EntrySource, JsRegex, AsSuggest, Default, BlackList, WhiteList, Root, LeafOnly, Unit, Error, Valid])
@Meta(StringValue)
@Meta(DataNodeType, StringNode)
class StringKind {}

/** the date schema meta */
@Meta(SchemaKind, [SCHEMA_KIND_STRING_DEFINE, SCHEMA_KIND_ORDER_STRING])
@Meta(Append, [EntrySource, JsRegex, Unit, Error, Valid])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRING}.schema`)
@Meta(Attach, SCHEMA_KIND_STRING_DEFINE)
class StringSchemaMeta implements StringSchema {
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_STRING_TYPE)
  base?: string;
}

/** The string schema usage. */
@Meta(SchemaKind, [SCHEMA_KIND_STRING_USAGE, SCHEMA_KIND_ORDER_STRING])
@Meta(Append, [AsSuggest, Default, BlackList, WhiteList, Root, LeafOnly, Unit, Error, Valid])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRING}.usage`)
@Meta(Attach, SCHEMA_KIND_STRING_USAGE)
// default
@Relation(Root,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@root'), 'default')
@Relation(LeafOnly,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@leafOnly'), 'default')
@Relation(WhiteList,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@whiteList'), 'default')
@Relation(BlackList,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@blackList'), 'default')
// blacklist
@Relation(Root,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, "@root"), 'blackList')
// whitelist
@Relation(BlackList,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, "@blackList"), 'whiteList')
@Relation(Root,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, "@root"), 'whiteList')
// root
@Relation(Visible,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.hascascade`, NODE_TYPE), 'root')
@Relation(OverrideType,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, NODE_TYPE), 'root')
// leafOnly
@Relation(Visible,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.hascascade`, NODE_TYPE), 'leafOnly')
class StringUsage {}

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