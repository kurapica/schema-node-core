// =============================================================================
// StructSchema — extension data stored under the "struct" key in NodeSchema
// StructProperty is the Property<StructSchema> bridge for getProperty/getProperties
// =============================================================================

import { Meta } from '../attribute/meta';
import { SchemaKind, NodeSchemaKind, ValueSchemaKind, SchemaType, Attach, Append, ForSchema, OfSchema, PropertyValueType, SchemaGenerator } from '../property/index';
import { Property } from '../property/property';
import { SCHEMA_KIND_STRUCT, SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_STRUCT, NS_SYSTEM_SCHEMA_PROPERTY_CORE } from '../utility/constant';

/** A single field definition within a struct. */
export interface StructFieldSchema {
  name: string;
  type: string;
  seqno?: number;
  extensions?: Record<string, unknown>;
}

export interface StructUnionValidation {
  fields: string[];
  error?: string;
}

@Meta(SchemaKind, [SCHEMA_KIND_STRUCT, 9])
@Meta(NodeSchemaKind, [SCHEMA_KIND_STRUCT, 9])
@Meta(ValueSchemaKind, [SCHEMA_KIND_STRUCT, 9])
@Meta(SchemaGenerator, generateStructSchema)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRUCT}.schema`)
@Meta(Attach, SCHEMA_KIND_STRUCT)
export class StructSchema {
  fields: StructFieldSchema[] = [];
  unionValids?: StructUnionValidation[];
}

/** Property bridge: when a NodeSchema holds struct data, getProperty(StructProperty) returns it. */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.struct`)
export class StructProperty extends Property<StructSchema> {}


export function generateStructSchema(name: string, target: object): void {
  const schemaTypeProp = getMetaProperty(target as Function, SchemaType);
  if (!schemaTypeProp?.hasValue) return;
  const fullName = schemaTypeProp.getValue<string>()!;
  const lastDot = fullName.lastIndexOf('.');
  const ns = lastDot >= 0 ? fullName.substring(0, lastDot) : '';
  const nm = lastDot >= 0 ? fullName.substring(lastDot + 1) : fullName;
  const structData = new StructSchema();
  structData.fields = buildStructFields(target);
  const node = new NodeSchema(nm, SCHEMA_KIND_STRUCT, ns);
  node.extensions = { struct: structData };
  saveSchema(node);
}

function buildStructFields(target: object): StructFieldSchema[] {
  const fields: StructFieldSchema[] = [];
  const proto = (target as { prototype?: object }).prototype;
  if (!proto) return fields;
  const metaStore = (proto as Record<symbol, Array<{ property: { _memberKey?: string } }>>)[Symbol.for('schema-node:meta')];
  if (!metaStore) return fields;
  let seqno = 0;
  for (const entry of metaStore) {
    const p = entry.property;
    if (!p._memberKey || !(entry.property instanceof SchemaType)) continue;
    fields.push({ name: p._memberKey, type: (entry.property as SchemaType).getValue<string>()!, seqno: seqno++, extensions: {} });
  }
  return fields;
}
