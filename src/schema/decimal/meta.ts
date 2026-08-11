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
import { DecimalValue } from '../../property/constraint/decimalValue';
import { Base } from '../../property/core/base';
import { RuntimeNodeType } from '../../property/core/runtimeNodeType';
import { buildFuncCall } from '../../property/funcCallProperty';
import { setProperty, setPropertyValue } from '../../property/propertyOwner';
import { saveNodeSchema } from '../../runtime/schemaRuntime';
import { DecimalType } from '../../runtime/type/scalar/decimalType';
import { NODE_SELF, NS_SYSTEM_SCHEMA_DECIMAL, NS_SYSTEM_SCHEMA_DECIMAL_TYPE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_DECIMAL,  SCHEMA_KIND_STRING } from '../../utility/constant';
import { combinePaths } from '../../utility/toolset';
import { NodeSchema } from '../node/type';
import { DecimalSchema } from './type';
import { DecimalProperty } from './property';

/** the decimal schema meta */
@Meta(SchemaKind, [SCHEMA_KIND_DECIMAL, SCHEMA_KIND_ORDER_DECIMAL])
@Meta(NodeSchemaKind, [SCHEMA_KIND_DECIMAL, SCHEMA_KIND_ORDER_DECIMAL])
@Meta(ValueSchemaKind, [SCHEMA_KIND_DECIMAL, SCHEMA_KIND_ORDER_DECIMAL])
@Meta(RuntimeNodeType, DecimalType)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_DECIMAL}.schema`)
@Meta(Attach, SCHEMA_KIND_DECIMAL)
@Meta(SchemaGenerator, generateDecimalSchema)
@Meta(DecimalValue)
class DecimalSchemaMeta {
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_DECIMAL_TYPE)
  base?: string;
}

/** Represents the decimal value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_DECIMAL_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, SCHEMA_KIND_DECIMAL))
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