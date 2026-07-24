import { getMetaPropertiesForSchema, getMetaProperty, Meta } from '../../attribute/meta';
import { Relation } from '../../attribute/relation';
import { Attach, Display, ForSchema, IProperty, NodeSchemaKind, OfSchema, Property, PropertyValueType, SchemaGenerator, SchemaKind, SchemaType, Valid, ValueSchemaKind, Visible } from '../../property';
import { Base } from '../../property/core/base';
import { RuntimeNodeType } from '../../property/core/runtimeNodeType';
import { buildFuncCall } from '../../property/funcCallProperty';
import { combineProperties, setProperty, setPropertyValue } from '../../property/propertyOwner';
import { Call } from '../../relation/call';
import { saveSystemSchema } from '../../runtime/schemaRuntime';
import { IntType } from '../../runtime/type';
import { NODE_SELF, NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_SCHEMA_INT, NS_SYSTEM_SCHEMA_INT_TYPE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_INT, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_INT, SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRING } from '../../utility/constant';
import { combinePaths } from '../../utility/toolset';
import { NodeSchema } from '../nodeSchema';

/** The int schema */
export interface IntSchema {
  /** The base schema type  */
  base?: string
}

/** the int schema meta */
@Meta(SchemaKind, [SCHEMA_KIND_INT, SCHEMA_KIND_ORDER_INT])
@Meta(NodeSchemaKind, [SCHEMA_KIND_INT, SCHEMA_KIND_ORDER_INT])
@Meta(ValueSchemaKind, [SCHEMA_KIND_INT, SCHEMA_KIND_ORDER_INT])
@Meta(RuntimeNodeType, IntType)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_INT}.schema`)
@Meta(Attach, SCHEMA_KIND_INT)
@Meta(SchemaGenerator, generateIntSchema)
class IntSchemaMeta {
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_INT_TYPE)
  base?: string;
}

/** The int property for node schema */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.int`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_INT}.schema`)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', SCHEMA_KIND_INT))
export class IntProperty extends Property<IntSchema>
{
  combine(other: IProperty): boolean {
    const otherSchema = other.getValue<IntSchema>();
    if (!otherSchema) return false;
    const selfSchema = this.getValue<IntSchema>();
    if (!selfSchema)
    {
      this.setValue(otherSchema);
      return true;
    }
    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_INT);
    this.setValue(selfSchema);
    return true;
  }
}

/** Represents the int value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_INT_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, SCHEMA_KIND_INT))
class IntTypeMeta {}

/** Generate the date schema */
function generateIntSchema(namespace: string, name: string, ctor: Function) {
  const nodeSchema : NodeSchema = { namespace, name, kind: SCHEMA_KIND_INT };
  const IntSchema : IntSchema = { base : getMetaProperty(ctor, Base)?.getValue<string>() ?? undefined };

  setPropertyValue(nodeSchema, Display, { key: combinePaths(namespace, name) });
  getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => setProperty(nodeSchema, p));
  getMetaPropertiesForSchema(SCHEMA_KIND_INT, ctor).forEach(p => setProperty(IntSchema, p));
  setPropertyValue(nodeSchema, IntProperty, IntSchema);
  saveSystemSchema(nodeSchema);
}