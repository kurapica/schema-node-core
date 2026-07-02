// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/Generics.cs
// =============================================================================

import { ReadOnly } from '../common/readOnly';
import { Meta } from '../../attribute/meta';
import { NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_PROPERTY_CORE, SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRUCT, SCHEMA_KIND_ARRAY, SCHEMA_KIND_FUNCTION, NS_SYSTEM_LIST, NS_SYSTEM_SCHEMA_NODE } from '../../utility/constant';
import { Property } from '../property';
import { ForSchema } from './forSchema';
import { OfSchema } from './ofSchema';
import { SchemaType } from './schemaType';

/**
 * A collection of generic type parameter declarations for a schema.
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT, SCHEMA_KIND_ARRAY, SCHEMA_KIND_FUNCTION])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(ReadOnly, true)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.generics`)
export class Generics extends Property<GenericParameter[]> {}


/** A single generic type parameter declaration. */
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.genericParameter`)
export class GenericParameter {
  @Meta(SchemaType, NS_SYSTEM_STRING)
  name: string = "T";

  @Meta(SchemaType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_SCHEMA_NODE}.valuetype>`)
  compatibles?: string[];
}
