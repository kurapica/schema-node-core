// =============================================================================
// ArraySchema — extension data under "array" key
// =============================================================================

import { Meta } from '../attribute/meta';
import { SchemaKind, NodeSchemaKind, ValueSchemaKind, SchemaType, Attach, Append, ForSchema, OfSchema, PropertyValueType } from '../property/index';
import { Property } from '../property/property';
import { SCHEMA_KIND_ARRAY, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_ARRAY, NS_SYSTEM_SCHEMA_PROPERTY_CORE } from '../utility/constant';
import { Relations } from './relationSchema';

export interface DataIndex {
  name: string;
  fields: string[];
  isUnique?: boolean;
}

/** Pure data interface. */
export interface ArraySchema {
  element: string;
}

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_ARRAY, 10])
@Meta(NodeSchemaKind, [SCHEMA_KIND_ARRAY, 10])
@Meta(ValueSchemaKind, [SCHEMA_KIND_ARRAY, 10])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ARRAY}.schema`)
@Meta(Attach, SCHEMA_KIND_ARRAY)
@Meta(Append, [Relations])
class ArraySchemaMeta implements ArraySchema {
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ARRAY}.elementtype`)
  element: string = '';
}

@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.array`)
export class ArrayProperty extends Property<ArraySchema> {}
