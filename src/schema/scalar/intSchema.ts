import { getMetaPropertiesForSchema, Meta } from '../../attribute/meta';
import { Relation } from '../../attribute/relation';
import { Display, ForSchema, IProperty, NodeSchemaKind, OfSchema, Property, SchemaGenerator, SchemaKind, SchemaType, ValueSchemaKind, Visible } from '../../property';
import { RuntimeNodeType } from '../../property/core/RuntimeNodeType';
import { combineProperties, setProperty, setPropertyValue } from '../../property/propertyOwner';
import { saveSchema } from '../../runtime/schemaRuntime';
import { IntType } from '../../runtime/type';
import { NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_SCHEMA_DECIMAL, NS_SYSTEM_SCHEMA_INT_TYPE, NS_SYSTEM_SCHEMA_PROPERTY_CORE, SCHEMA_KIND_INT, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_INT, SCHEMA_KIND_PROPERTY } from '../../utility/constant';
import { combinePaths } from '../../utility/toolset';
import { NodeSchema } from '../nodeSchema';

/** The int schema */
export interface IntSchema {
  /** The base schema type  */
  base?: string
}

/** the date schema meta */
@Meta(SchemaKind, [SCHEMA_KIND_INT, SCHEMA_KIND_ORDER_INT])
@Meta(NodeSchemaKind, [SCHEMA_KIND_INT, SCHEMA_KIND_ORDER_INT])
@Meta(ValueSchemaKind, [SCHEMA_KIND_INT, SCHEMA_KIND_ORDER_INT])
@Meta(RuntimeNodeType, IntType)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_DECIMAL}.schema`)
@Meta(SchemaGenerator, generateIntSchema)
class IntSchemaMeta {
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_INT_TYPE)
  base?: string;
}

/** The date property for node schema */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.int`)
@Relation(Visible, NS_SYSTEM_LOGIC_EQ, '$kind', SCHEMA_KIND_INT)
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

/** Generate the date schema */
function generateIntSchema(namespace: string, name: string, ctor: Function) {
  const nodeSchema : NodeSchema = { namespace, name, kind: SCHEMA_KIND_INT };
  const IntSchema : IntSchema = {};

  setPropertyValue(nodeSchema, Display, { key: combinePaths(namespace, name) });
  getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => setProperty(nodeSchema, p));
  getMetaPropertiesForSchema(SCHEMA_KIND_INT, ctor).forEach(p => setProperty(IntSchema, p));
  setPropertyValue(nodeSchema, IntProperty, IntSchema);
  saveSchema(nodeSchema);
}