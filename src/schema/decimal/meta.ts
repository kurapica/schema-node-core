import { getMetaProperty, Meta } from '../../attribute/meta';
import { Attach } from '../struct/property/attach';
import { Display } from '../../property/common/display';
import { NodeKind } from '../../property/record/nodeKind';
import { OfNodeKind } from '../../property/core/ofNodeKind';
import { SchemaGenerator } from '../../property/core/schemaGenerator';
import { SchemaKind } from '../../property/record/schemaKind';
import { SchemaType } from '../../property/core/schemaType';
import { Valid } from '../../property/common/valid';
import { NodeValueKind } from '../../property/record/nodeValueKind';
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
import { Error } from '../../property/common/error';
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

import type { NodeSchema } from '../node/type';
import type { DecimalSchema } from './type';

import { NODE_SELF, NS_SYSTEM_INTRINSIC, NS_SYSTEM_SCHEMA_DECIMAL, NS_SYSTEM_SCHEMA_DECIMAL_TYPE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_NODE_KIND, SCHEMA_KIND_NODE_DECIMAL, SCHEMA_KIND_NODE_DECIMAL_DEFINE, SCHEMA_KIND_NODE_DECIMAL_USAGE, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_DECIMAL, NODE_KIND_STRING, NODE_KIND_DECIMAL } from '../../utility/constant';

/** The decimal schema kind. */
@Meta(SchemaKind, [SCHEMA_KIND_NODE_DECIMAL, SCHEMA_KIND_ORDER_DECIMAL])
@Meta(NodeKind, [NODE_KIND_DECIMAL, SCHEMA_KIND_ORDER_DECIMAL])
@Meta(NodeValueKind, [NODE_KIND_DECIMAL, SCHEMA_KIND_ORDER_DECIMAL])
@Meta(RuntimeNodeType, DecimalType)
@Meta(SchemaGenerator, generateDecimalSchema)
@Meta(SchemaUsage, `${NS_SYSTEM_SCHEMA_DECIMAL}.usage`)
@Meta(Append, [EntrySource, JsRegex, AsSuggest, Default, BlackList, WhiteList, Unit, Error, StackUpLimit, Valid])
@Meta(DecimalValue)
@Meta(DataNodeType, DecimalNode)
class DecimalKind {}

/** the decimal schema meta */
@Meta(SchemaKind, [SCHEMA_KIND_NODE_DECIMAL_DEFINE, SCHEMA_KIND_ORDER_DECIMAL])
@Meta(Append, [EntrySource, JsRegex, Unit, Error, Valid])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_DECIMAL}.schema`)
@Meta(Attach, SCHEMA_KIND_NODE_DECIMAL_DEFINE)
class DecimalSchemaMeta implements DecimalSchema {
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_DECIMAL_TYPE)
  base?: string;
}

/** The decimal schema usage. */
@Meta(SchemaKind, [SCHEMA_KIND_NODE_DECIMAL_USAGE, SCHEMA_KIND_ORDER_DECIMAL])
@Meta(Append, [AsSuggest, Default, BlackList, WhiteList, Unit, Error, StackUpLimit])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_DECIMAL}.usage`)
@Meta(Attach, SCHEMA_KIND_NODE_DECIMAL_USAGE)
@Relation('whitelist','call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@whiteList'), 'default')
@Relation('blacklist','call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@blackList'), 'default')
class DecimalUsage {}

/** Represents the decimal value type */
@Meta(OfNodeKind, NODE_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_DECIMAL_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_NODE_KIND, NODE_SELF, false, NODE_KIND_DECIMAL))
class DecimalTypeMeta {}

/** Generate the date schema */
function generateDecimalSchema(namespace: string, name: string, ctor: Function) {
  const nodeSchema : NodeSchema = { namespace, name, kind: NODE_KIND_DECIMAL };
  const decimalSchema : DecimalSchema = { base : getMetaProperty(ctor, Base)?.getValue<string>() ?? undefined };

  setPropertyValue(nodeSchema, Display, { key: combinePaths(namespace, name) });
  getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => setProperty(nodeSchema, p));
  getMetaPropertiesForSchema(SCHEMA_KIND_NODE_DECIMAL, ctor).forEach(p => setProperty(decimalSchema, p));
  setPropertyValue(nodeSchema, DecimalProperty, decimalSchema);
  saveNodeSchema(nodeSchema);
}