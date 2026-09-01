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
import { IntProperty } from './int';
import { IntType } from './runtime';
import { IntValue } from './property/intValue';
import { IntNode } from './node';
import { DataNodeType } from '../../property/core/dataNodeType';
import { SchemaUsage } from '../../property/core/schemaUsage';
import { Append } from '../../property/core/append';

import type { NodeSchema } from '../node/type';
import type { IntSchema } from './type';

import { NODE_SELF, NS_SYSTEM_INTRINSIC, NS_SYSTEM_SCHEMA_INT, NS_SYSTEM_SCHEMA_INT_TYPE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_INT, SCHEMA_KIND_INT_DEFINE, SCHEMA_KIND_INT_USAGE, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_INT, SCHEMA_KIND_STRING } from '../../utility/constant';
import { EntrySource } from '../../property/core/entrySource';
import { AsSuggest } from '../../property/common/asSuggest';
import { Default } from '../../property/common/default';
import { BlackList } from '../../property/common/blackList';
import { WhiteList } from '../../property/common/whiteList';
import { Unit } from '../../property/common/unit';
import { StackUpLimit } from '../../property/common/stackUpLimit';
import { Relation } from '../../attribute/relation';
import { JsRegex } from '../../property/common/jsRegex';

/** The int schema kind. */
@Meta(SchemaKind, [SCHEMA_KIND_INT, SCHEMA_KIND_ORDER_INT])
@Meta(NodeSchemaKind, [SCHEMA_KIND_INT, SCHEMA_KIND_ORDER_INT])
@Meta(ValueSchemaKind, [SCHEMA_KIND_INT, SCHEMA_KIND_ORDER_INT])
@Meta(RuntimeNodeType, IntType)
@Meta(SchemaGenerator, generateIntSchema)
@Meta(SchemaUsage, `${NS_SYSTEM_SCHEMA_INT}.usage`)
@Meta(Append, [EntrySource, JsRegex, AsSuggest, Default, BlackList, WhiteList, Unit, Error, StackUpLimit, Valid])
@Meta(IntValue)
@Meta(DataNodeType, IntNode)
class IntKind {}

/** the int schema meta */
@Meta(SchemaKind, [SCHEMA_KIND_INT_DEFINE, SCHEMA_KIND_ORDER_INT])
@Meta(Append, [EntrySource, JsRegex, Unit, Error, Valid])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_INT}.schema`)
@Meta(Attach, SCHEMA_KIND_INT_DEFINE)
class IntSchemaMeta implements IntSchema {
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_INT_TYPE)
    base?: string;
}

/** The int schema usage. */
@Meta(SchemaKind, [SCHEMA_KIND_INT_USAGE, SCHEMA_KIND_ORDER_INT])
@Meta(Append, [AsSuggest, Default, BlackList, WhiteList, Unit, Error, StackUpLimit, Valid])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_INT}.usage`)
@Meta(Attach, SCHEMA_KIND_INT_USAGE)
@Relation(WhiteList,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@whiteList'), 'default')
@Relation(BlackList,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@blackList'), 'default')
class IntUsage {}

/** Represents the int value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_INT_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, false, SCHEMA_KIND_INT))
class IntTypeMeta { }

/** Generate the date schema */
function generateIntSchema(namespace: string, name: string, ctor: Function) {
    const nodeSchema: NodeSchema = { namespace, name, kind: SCHEMA_KIND_INT };
    const intSchema: IntSchema = { base: getMetaProperty(ctor, Base)?.getValue<string>() ?? undefined };

    setPropertyValue(nodeSchema, Display, { key: combinePaths(namespace, name) });
    getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => setProperty(nodeSchema, p));
    getMetaPropertiesForSchema(SCHEMA_KIND_INT, ctor).forEach(p => setProperty(intSchema, p));
    setPropertyValue(nodeSchema, IntProperty, intSchema);
    saveNodeSchema(nodeSchema);
}