// =============================================================================
// ObjectSchema — arbitrary JSON value container
// =============================================================================

import { getMetaPropertiesForSchema, Meta } from '../attribute/meta';
import { Base } from '../property/core/base';
import { RuntimeNodeType } from '../property/core/runtimeNodeType';
import { buildFuncCall } from '../property/funcCallProperty';
import { SchemaKind, NodeSchemaKind, ValueSchemaKind, OfSchema, SchemaType, Valid, Display } from '../property/index';
import { setPropertyValue, setProperty } from '../property/propertyOwner';
import { saveSystemSchema } from '../runtime/schemaRuntime';
import { ObjectType } from '../runtime/type';
import { NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_OBJECT_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_NODE, SCHEMA_KIND_OBJECT, SCHEMA_KIND_ORDER_OBJECT, SCHEMA_KIND_STRING } from '../utility/constant';
import { combinePaths } from '../utility/toolset';
import { NodeSchema } from './nodeSchema';

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_OBJECT, SCHEMA_KIND_ORDER_OBJECT])
@Meta(NodeSchemaKind, [SCHEMA_KIND_OBJECT, SCHEMA_KIND_ORDER_OBJECT])
@Meta(ValueSchemaKind, [SCHEMA_KIND_OBJECT, SCHEMA_KIND_ORDER_OBJECT])
@Meta(RuntimeNodeType, ObjectType)
class ObjectSchemaMeta {}

/** Represents the object value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_OBJECT_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, SCHEMA_KIND_OBJECT))
class ObjectTypeMeta {}

/** Generate the object schema type */
function generateObjectSchema(namespace: string, name: string, ctor: Function)
{
    const nodeschema: NodeSchema = { namespace, name, kind: SCHEMA_KIND_OBJECT }
    setPropertyValue(nodeschema, Display, { key : combinePaths(namespace, name)})
    getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => { setProperty(nodeschema, p) });
    saveSystemSchema(nodeschema);
}