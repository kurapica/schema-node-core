import { Meta } from '../../attribute/meta';
import { Display } from '../../property/common/display';
import { OfSchema } from '../../property/core/ofSchema';
import { SchemaGenerator } from '../../property/core/schemaGenerator';
import { SchemaType } from '../../property/core/schemaType';
import { Valid } from '../../property/constraint/valid';
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
import { BoolValue } from './valid';
import { BoolNode } from './node';
import { DataNodeType } from '../../property/core/dataNodeType';

import type { NodeSchema } from '../node/type';

import { NODE_SELF, NS_SYSTEM_SCHEMA_BOOL_TYPE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_BOOL, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_BOOL, SCHEMA_KIND_STRING } from '../../utility/constant';

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL])
@Meta(NodeSchemaKind, [SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL])
@Meta(ValueSchemaKind, [SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL])
@Meta(RuntimeNodeType, BoolType)
@Meta(SchemaGenerator, generateBoolSchema)
@Meta(BoolValue)
@Meta(DataNodeType, BoolNode)
class BoolSchemaMeta {}

/** Represents the bool value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_BOOL_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, SCHEMA_KIND_BOOL))
class BoolTypeMeta {}

/** Generate the bool schema type */
function generateBoolSchema(namespace: string, name: string, ctor: Function)
{
    const nodeschema: NodeSchema = { namespace, name, kind: SCHEMA_KIND_BOOL }
    setPropertyValue(nodeschema, Display, { key : combinePaths(namespace, name)})
    getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => { setProperty(nodeschema, p) });
    saveNodeSchema(nodeschema);
}