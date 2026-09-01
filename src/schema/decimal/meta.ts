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
import { DecimalProperty } from './decimal';
import { DecimalType } from './runtime';
import { DecimalValue } from './property/decimalValue';
import { DecimalNode } from './node';
import { DataNodeType } from '../../property/core/dataNodeType';

import type { NodeSchema } from '../node/type';
import type { DecimalSchema } from './type';

import { NODE_SELF, NS_SYSTEM_INTRINSIC, NS_SYSTEM_SCHEMA_DECIMAL, NS_SYSTEM_SCHEMA_DECIMAL_TYPE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_DECIMAL_DEFINE, SCHEMA_KIND_DECIMAL_USAGE, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_DECIMAL, SCHEMA_KIND_STRING } from '../../utility/constant';
import { SchemaUsage } from '../../property/core/schemaUsage';
import { Append } from '../../property/core/append';
import { EntrySource } from '../../property/core/entrySource';
import { AsSuggest } from '../../property/common/asSuggest';
import { Default } from '../../property/common/default';
import { BlackList } from '../../property/common/blackList';
import { WhiteList } from '../../property/common/whiteList';
import { Unit } from '../../property/common/unit';
import { StackUpLimit } from '../../property/common/stackUpLimit';
import { Relation } from '../../attribute/relation';
import { JsRegex } from '../../property/common/jsRegex';

/** The decimal schema kind. */
@Meta(SchemaKind, [SCHEMA_KIND_DECIMAL, SCHEMA_KIND_ORDER_DECIMAL])
@Meta(NodeSchemaKind, [SCHEMA_KIND_DECIMAL, SCHEMA_KIND_ORDER_DECIMAL])
@Meta(ValueSchemaKind, [SCHEMA_KIND_DECIMAL, SCHEMA_KIND_ORDER_DECIMAL])
@Meta(RuntimeNodeType, DecimalType)
@Meta(SchemaGenerator, generateDecimalSchema)
@Meta(SchemaUsage, `${NS_SYSTEM_SCHEMA_DECIMAL}.usage`)
@Meta(Append, [EntrySource, JsRegex, AsSuggest, Default, BlackList, WhiteList, Unit, Error, StackUpLimit, Valid])
@Meta(DecimalValue)
@Meta(DataNodeType, DecimalNode)
class DecimalKind {}

/** the decimal schema meta */
@Meta(SchemaKind, [SCHEMA_KIND_DECIMAL_DEFINE, SCHEMA_KIND_ORDER_DECIMAL])
@Meta(Append, [EntrySource, JsRegex, Unit, Error, Valid])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_DECIMAL}.schema`)
@Meta(Attach, SCHEMA_KIND_DECIMAL_DEFINE)
class DecimalSchemaMeta implements DecimalSchema {
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_DECIMAL_TYPE)
  base?: string;
}

/** The decimal schema usage. */
@Meta(SchemaKind, [SCHEMA_KIND_DECIMAL_USAGE, SCHEMA_KIND_ORDER_DECIMAL])
@Meta(Append, [AsSuggest, Default, BlackList, WhiteList, Unit, Error, StackUpLimit, Valid])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_DECIMAL}.usage`)
@Meta(Attach, SCHEMA_KIND_DECIMAL_USAGE)
@Relation(`${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.whitelist`,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@whiteList'), 'default')
@Relation(`${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.blacklist`,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@blackList'), 'default')
class DecimalUsage {}

/** Represents the decimal value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_DECIMAL_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, false, SCHEMA_KIND_DECIMAL))
class DecimalTypeMeta {}

/** Generate the date schema */
function generateDecimalSchema(namespace: string, name: string, ctor: Function) {
  const nodeSchema : NodeSchema = { namespace, name, kind: SCHEMA_KIND_DECIMAL };
  const decimalSchema : DecimalSchema = { base : getMetaProperty(ctor, Base)?.getValue<string>() ?? undefined };

  setPropertyValue(nodeSchema, Display, { key: combinePaths(namespace, name) });
  getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => setProperty(nodeSchema, p));
  getMetaPropertiesForSchema(SCHEMA_KIND_DECIMAL, ctor).forEach(p => setProperty(decimalSchema, p));
  setPropertyValue(nodeSchema, DecimalProperty, decimalSchema);
  saveNodeSchema(nodeSchema);
}