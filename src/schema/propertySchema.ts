// =============================================================================
// PropertySchema — extension data under "property" key
// =============================================================================

import { Meta } from '../attribute/meta';
import { SchemaKind, NodeSchemaKind, SchemaType, Attach, Append, ForSchema, OfSchema, SchemaGenerator } from '../property/index';
import { Property } from '../property/property';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_NODE, NS_SYSTEM_SCHEMA_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CORE } from '../utility/constant';

@Meta(SchemaKind, [SCHEMA_KIND_PROPERTY, 12])
@Meta(NodeSchemaKind, [SCHEMA_KIND_PROPERTY, 12])
@Meta(SchemaGenerator, generatePropertySchema)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY}.schema`)
@Meta(Attach, SCHEMA_KIND_PROPERTY)
export class PropertySchema {
  property: string = '';
  valueType?: string;
  depends?: string[];
  forSchemas?: string[];
  forValues?: string[];
  constraint?: boolean;
  typeref?: boolean;
  relationOnly?: boolean;
  convert?: boolean;
}

@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.prop`)
export class PropProperty extends Property<PropertySchema> {}


export function generatePropertySchema(namespace: string, name: string, target: object): void {
  const schemaTypeProp = getMetaProperty(target as Function, SchemaType);
  if (!schemaTypeProp?.hasValue) return;
  const fullName = schemaTypeProp.getValue<string>()!;
  const lastDot = fullName.lastIndexOf('.');
  const ns = lastDot >= 0 ? fullName.substring(0, lastDot) : '';
  const nm = lastDot >= 0 ? fullName.substring(lastDot + 1) : fullName;
  const propData = new PropertySchema();
  const temp = new (target as new () => IProperty)();
  propData.property = temp.name;
  const forSchemaProp = getMetaProperty(target as Function, ForSchema);
  if (forSchemaProp?.hasValue) propData.forSchemas = forSchemaProp.getValue<string[]>();
  const proto = (target as { prototype?: Record<string, unknown> }).prototype;
  if (proto) {
    propData.constraint = typeof proto.validate === 'function';
    propData.typeref = typeof (proto as Record<string, unknown>).getRefTypes === 'function';
  }
  const node = new NodeSchema(nm, SCHEMA_KIND_PROPERTY, ns);
  node.extensions = { property: propData };
  runtime.saveSchema(node);
}
