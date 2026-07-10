import { getMetaPropertiesForSchema, Meta } from '../../attribute/meta';
import { Display, OfSchema, SchemaGenerator, SchemaType, Valid } from '../../property';
import { Base } from '../../property/core/base';
import { RuntimeNodeType } from '../../property/core/RuntimeNodeType';
import { setProperty, setPropertyValue } from '../../property/propertyOwner';
import { NodeSchemaKind } from '../../property/record/nodeSchemaKind';
import { SchemaKind } from '../../property/record/schemaKind';
import { ValueSchemaKind } from '../../property/record/valueSchemaKind';
import { saveSchema } from '../../runtime/schemaRuntime';
import { BoolType } from '../../runtime/type/scalar/boolType';
import { NODE_SELF, NS_SYSTEM_SCHEMA_BOOL_TYPE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_BOOL, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_BOOL, SCHEMA_KIND_STRING } from '../../utility/constant';
import { combinePaths } from '../../utility/toolset';
import { NodeSchema } from '../nodeSchema';

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL])
@Meta(NodeSchemaKind, [SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL])
@Meta(ValueSchemaKind, [SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL])
@Meta(RuntimeNodeType, BoolType)
@Meta(SchemaGenerator, generateBoolSchema)
class BoolSchemaMeta {}

/** Represents the bool value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_BOOL_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, { func: NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, args: [ { source: NODE_SELF }, { value: SCHEMA_KIND_BOOL }] } )
class BoolTypeMeta {}

/** Generate the bool schema type */
function generateBoolSchema(namespace: string, name: string, ctor: Function)
{
    const nodeschema: NodeSchema = { namespace, name, kind: SCHEMA_KIND_BOOL }
    setPropertyValue(nodeschema, Display, { key : combinePaths(namespace, name)})
    getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => { setProperty(nodeschema, p) });
    saveSystemSchema(nodeschema);
}