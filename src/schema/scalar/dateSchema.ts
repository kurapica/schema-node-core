import { getMetaPropertiesForSchema, Meta } from '../../attribute/meta';
import { Relation } from '../../attribute/relation';
import { Display, ForSchema, IProperty, NodeSchemaKind, OfSchema, Property, SchemaGenerator, SchemaKind, SchemaType, ValueSchemaKind, Visible } from '../../property';
import { RuntimeNodeType } from '../../property/core/RuntimeNodeType';
import { combineProperties, setProperty, setPropertyValue } from '../../property/propertyOwner';
import { saveSchema } from '../../runtime/schemaRuntime';
import { DateType } from '../../runtime/type';
import { NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_SCHEMA_DATE, NS_SYSTEM_SCHEMA_DATE_TYPE, NS_SYSTEM_SCHEMA_PROPERTY_CORE, SCHEMA_KIND_DATE, SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_DATE, SCHEMA_KIND_PROPERTY } from '../../utility/constant';
import { combinePaths } from '../../utility/toolset';
import { NodeSchema } from '../nodeSchema';

/** The date schema */
export interface DateSchema {
  /** The base schema type */
  base?: string;
}

/** the date schema meta */
@Meta(SchemaKind, [SCHEMA_KIND_DATE, SCHEMA_KIND_ORDER_DATE])
@Meta(NodeSchemaKind, [SCHEMA_KIND_DATE, SCHEMA_KIND_ORDER_DATE])
@Meta(ValueSchemaKind, [SCHEMA_KIND_DATE, SCHEMA_KIND_ORDER_DATE])
@Meta(RuntimeNodeType, DateType)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_DATE}.schema`)
@Meta(SchemaGenerator, generateDateSchema)
class DateSchemaMeta {
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_DATE_TYPE)
  base?: string;
}

/** The date property for node schema */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.date`)
@Relation(Visible, NS_SYSTEM_LOGIC_EQ, '$kind', SCHEMA_KIND_DATE)
export class DateProperty extends Property<DateSchema>
{
  combine(other: IProperty): boolean {
    const otherSchema = other.getValue<DateSchema>();
    if (!otherSchema) return false;
    const selfSchema = this.getValue<DateSchema>();
    if (!selfSchema)
    {
      this.setValue(otherSchema);
      return true;
    }
    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_DATE);
    this.setValue(selfSchema);
    return true;
  }
}

/** Generate the date schema */
function generateDateSchema(namespace: string, name: string, ctor: Function)
{
  const nodeSchema : NodeSchema = { namespace, name, kind: SCHEMA_KIND_DATE };
  const dateSchema : DateSchema = {};

  setPropertyValue(nodeSchema, Display, { key: combinePaths(namespace, name) });
  getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => setProperty(nodeSchema, p));
  getMetaPropertiesForSchema(SCHEMA_KIND_DATE, ctor).forEach(p => setProperty(dateSchema, p));
  setPropertyValue(nodeSchema, DateProperty, dateSchema);
  saveSchema(nodeSchema);
}