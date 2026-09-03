import { Meta } from '../../attribute/meta';
import { Display } from '../../property/common/display';
import { OfSchema } from '../../property/core/ofSchema';
import { SchemaGenerator } from '../../property/core/schemaGenerator';
import { SchemaType } from '../../property/core/schemaType';
import { Default, Valid } from '../../property/common/';
import { Base } from '../../property/core/base';
import { RuntimeNodeType } from '../../property/core/runtimeNodeType';
import { buildFuncCall } from '../../schema/function/type';
import { setProperty, setPropertyValue } from '../../property/propertyOwner';
import { NodeSchemaKind } from '../../property/record/nodeSchemaKind';
import { SchemaKind } from '../../property/record/schemaKind';
import { ValueSchemaKind } from '../../property/record/valueSchemaKind';
import { getMetaPropertiesForSchema, saveNodeSchema } from '../../runtime/schemaRuntime';
import { combinePaths } from '../../utility/toolset';
import { BoolType } from './runtime';
import { BoolValue } from './property/boolValue';
import { BoolNode } from './node';
import { DataNodeType } from '../../property/core/dataNodeType';
import { SchemaUsage } from '../../property/core/schemaUsage';
import { Append } from '../../property/core/append';
import { Attach } from '../struct/property/attach';

import type { NodeSchema } from '../node/type';

import { NODE_SELF, NS_SYSTEM_SCHEMA_BOOL, NS_SYSTEM_SCHEMA_BOOL_TYPE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_BOOL, SCHEMA_KIND_BOOL_USAGE, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_BOOL, SCHEMA_KIND_STRING } from '../../utility/constant';

/** The bool schema kind. */
@Meta(SchemaKind, [SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL])
@Meta(NodeSchemaKind, [SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL])
@Meta(ValueSchemaKind, [SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL])
@Meta(RuntimeNodeType, BoolType)
@Meta(SchemaGenerator, generateBoolSchema)
@Meta(SchemaUsage, `${NS_SYSTEM_SCHEMA_BOOL}.usage`)
@Meta(Append, [Default])
@Meta(BoolValue)
@Meta(DataNodeType, BoolNode)
class BoolKind {}

@Meta(SchemaKind, [SCHEMA_KIND_BOOL_USAGE, SCHEMA_KIND_ORDER_BOOL])
@Meta(Append, [Default])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_BOOL}.usage`)
@Meta(Attach, SCHEMA_KIND_BOOL_USAGE)
class BoolUsage {}

/** Represents the bool value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_BOOL_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, false, SCHEMA_KIND_BOOL))
class BoolTypeMeta {}

/** Generate the bool schema type */
function generateBoolSchema(namespace: string, name: string, ctor: Function)
{
    const nodeschema: NodeSchema = { namespace, name, kind: SCHEMA_KIND_BOOL }
    setPropertyValue(nodeschema, Display, { key : combinePaths(namespace, name)})
    getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => { setProperty(nodeschema, p) });
    saveNodeSchema(nodeschema);
}