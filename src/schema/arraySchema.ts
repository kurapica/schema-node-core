// =============================================================================
// ArraySchema — extension data under "array" key
// =============================================================================

import { Meta } from '../attribute/meta';
import { SchemaKindRecord, NodeSchemaKindRecord, ValueSchemaKindRecord, SchemaType, Attach, Append, ForSchema, OfSchema, PropertyValueType } from '../property/index';
import { Property } from '../property/property';
import { SCHEMA_KIND_ARRAY, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_ARRAY, NS_SYSTEM_SCHEMA_PROPERTY_CORE } from '../utility/constant';
import type { StructRelationSchema } from './structSchema';

export interface DataIndex {
  name: string;
  fields: string[];
  isUnique?: boolean;
}

@Meta(SchemaKindRecord, [SCHEMA_KIND_ARRAY, 10])
@Meta(NodeSchemaKindRecord, [SCHEMA_KIND_ARRAY, 10])
@Meta(ValueSchemaKindRecord, [SCHEMA_KIND_ARRAY, 10])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ARRAY}.schema`)
@Meta(Attach, SCHEMA_KIND_ARRAY)
export class ArraySchema {
  element: string = '';
  single?: boolean;
  primary?: string[];
  indexes?: DataIndex[];
  relations?: StructRelationSchema[];
  atomic?: boolean;
}

@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.array`)
export class ArrayProperty extends Property<ArraySchema> {}
