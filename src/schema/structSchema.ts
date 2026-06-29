// =============================================================================
// StructSchema — extension data stored under the "struct" key in NodeSchema
// StructProperty is the Property<StructSchema> bridge for getProperty/getProperties
// =============================================================================

import { Meta } from '../attribute/meta';
import { SchemaKindRecord, NodeSchemaKindRecord, ValueSchemaKindRecord, SchemaType, Attach, Append, ForSchema, OfSchema, PropertyValueType } from '../property/index';
import { Property } from '../property/property';
import { SCHEMA_KIND_STRUCT, SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_STRUCT, NS_SYSTEM_SCHEMA_PROPERTY_CORE } from '../utility/constant';

/** A single field definition within a struct. */
export interface StructFieldSchema {
  name: string;
  type: string;
  seqno?: number;
  extensions?: Record<string, unknown>;
}

export interface StructRelationSchema {
  field: string;
  prop: string;
  func: string;
  args: { value: unknown }[];
}

export interface StructUnionValidation {
  fields: string[];
  error?: string;
}

@Meta(SchemaKindRecord, [SCHEMA_KIND_STRUCT, 9])
@Meta(NodeSchemaKindRecord, [SCHEMA_KIND_STRUCT, 9])
@Meta(ValueSchemaKindRecord, [SCHEMA_KIND_STRUCT, 9])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRUCT}.schema`)
@Meta(Attach, SCHEMA_KIND_STRUCT)
export class StructSchema {
  base?: string;
  fields: StructFieldSchema[] = [];
  relations?: StructRelationSchema[];
  unionValids?: StructUnionValidation[];
  atomic?: boolean;
}

/** Property bridge: when a NodeSchema holds struct data, getProperty(StructProperty) returns it. */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.struct`)
export class StructProperty extends Property<StructSchema> {}
