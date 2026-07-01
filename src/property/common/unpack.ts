// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Unpack.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType } from '../index';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_SCHEMA_PROPERTY_COMMON } from '../../utility/constant';

/**
 * Declare the struct field is used for pack all non-struct fields data into it
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.unpack`)
export class Unpack extends Property<boolean> {}
