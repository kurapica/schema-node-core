// =============================================================================
// ObjectSchema — arbitrary JSON value container
// =============================================================================

import { Meta } from '../../attribute/meta';
import { Base } from '../../property/core/base';
import { RuntimeNodeType } from '../../property/core/runtimeNodeType';
import { buildFuncCall } from '../../schema/function/type';
import { SchemaKind } from '../../property/record/schemaKind';
import { NodeSchemaKind } from '../../property/record/nodeSchemaKind';
import { ValueSchemaKind } from '../../property/record/valueSchemaKind';
import { OfSchema } from '../../property/core/ofSchema';
import { SchemaType } from '../../property/core/schemaType';
import { Valid } from '../../property/constraint/valid';
import { Display } from '../../property/common/display';
import { setPropertyValue, setProperty } from '../../property/propertyOwner';
import { getMetaPropertiesForSchema, saveNodeSchema } from '../../runtime/schemaRuntime';
import { combinePaths } from '../../utility/toolset';
import { ObjectType } from './runtime';
import { AnyNode } from './node';
import { DataNodeType } from '../../property/core/dataNodeType';
import { SchemaGenerator } from '../../property';

import type { NodeSchema } from '../node/type';

import { NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_OBJECT_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_NODE, SCHEMA_KIND_OBJECT, SCHEMA_KIND_ORDER_OBJECT, SCHEMA_KIND_STRING } from '../../utility/constant';

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_OBJECT, SCHEMA_KIND_ORDER_OBJECT])
@Meta(NodeSchemaKind, [SCHEMA_KIND_OBJECT, SCHEMA_KIND_ORDER_OBJECT])
@Meta(ValueSchemaKind, [SCHEMA_KIND_OBJECT, SCHEMA_KIND_ORDER_OBJECT])
@Meta(SchemaGenerator, generateObjectSchema)
@Meta(RuntimeNodeType, ObjectType)
@Meta(DataNodeType, AnyNode)
class ObjectKind {}

/** Represents the object value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_OBJECT_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, false, SCHEMA_KIND_OBJECT))
class ObjectTypeMeta {}

/** Generate the object schema type */
function generateObjectSchema(namespace: string, name: string, ctor: Function)
{
    const nodeschema: NodeSchema = { namespace, name, kind: SCHEMA_KIND_OBJECT }
    setPropertyValue(nodeschema, Display, { key : combinePaths(namespace, name)})
    getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => { setProperty(nodeschema, p) });
    saveNodeSchema(nodeschema);
}