import { getMetaPropertiesForSchema, Meta } from '../../attribute/meta';
import { Display, SchemaGenerator } from '../../property';
import { RuntimeNodeType } from '../../property/core/RuntimeNodeType';
import { setProperty, setPropertyValue } from '../../property/propertyOwner';
import { NodeSchemaKind } from '../../property/record/nodeSchemaKind';
import { SchemaKind } from '../../property/record/schemaKind';
import { ValueSchemaKind } from '../../property/record/valueSchemaKind';
import { saveSchema } from '../../runtime/schemaRuntime';
import { BoolType } from '../../runtime/type/scalar/boolType';
import { SCHEMA_KIND_BOOL, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_BOOL } from '../../utility/constant';
import { getFullName } from '../../utility/toolset';
import { NodeSchema } from '../nodeSchema';

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL])
@Meta(NodeSchemaKind, [SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL])
@Meta(ValueSchemaKind, [SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL])
@Meta(RuntimeNodeType, BoolType)
@Meta(SchemaGenerator, generateBoolSchema)
class BoolSchemaMeta {}

/** Generate the bool schema type */
function generateBoolSchema(namespace: string, name: string, ctor: Function)
{
    const nodeschema: NodeSchema = { namespace, name, kind: SCHEMA_KIND_BOOL }
    setPropertyValue(nodeschema, Display, { key : getFullName(namespace, name)})
    getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => { setProperty(nodeschema, p) });
    saveSchema(nodeschema);
}