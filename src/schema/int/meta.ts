import { getMetaPropertiesForSchema, getMetaProperty, Meta } from '../../attribute/meta';
import { Attach } from '../../property/core/attach';
import { Display } from '../../property/common/display';
import { NodeSchemaKind } from '../../property/record/nodeSchemaKind';
import { OfSchema } from '../../property/core/ofSchema';
import { SchemaGenerator } from '../../property/core/schemaGenerator';
import { SchemaKind } from '../../property/record/schemaKind';
import { SchemaType } from '../../property/core/schemaType';
import { Valid } from '../../property/constraint/valid';
import { ValueSchemaKind } from '../../property/record/valueSchemaKind';
import { IntValue } from '../../property/constraint/intValue';
import { Base } from '../../property/core/base';
import { RuntimeNodeType } from '../../property/core/runtimeNodeType';
import { buildFuncCall } from '../../property/funcCallProperty';
import { setProperty, setPropertyValue } from '../../property/propertyOwner';
import { saveNodeSchema } from '../../runtime/schemaRuntime';
import { IntType } from '../../runtime/type/scalar/intType';
import { NODE_SELF, NS_SYSTEM_SCHEMA_INT, NS_SYSTEM_SCHEMA_INT_TYPE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_INT, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_INT, SCHEMA_KIND_STRING } from '../../utility/constant';
import { combinePaths } from '../../utility/toolset';
import { NodeSchema } from '../node/type';
import { IntSchema } from './type';
import { IntProperty } from './property';

/** the int schema meta */
@Meta(SchemaKind, [SCHEMA_KIND_INT, SCHEMA_KIND_ORDER_INT])
@Meta(NodeSchemaKind, [SCHEMA_KIND_INT, SCHEMA_KIND_ORDER_INT])
@Meta(ValueSchemaKind, [SCHEMA_KIND_INT, SCHEMA_KIND_ORDER_INT])
@Meta(RuntimeNodeType, IntType)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_INT}.schema`)
@Meta(Attach, SCHEMA_KIND_INT)
@Meta(SchemaGenerator, generateIntSchema)
@Meta(IntValue)
class IntSchemaMeta {
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_INT_TYPE)
    base?: string;
}

/** Represents the int value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_INT_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, SCHEMA_KIND_INT))
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