// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Disable.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, ForSchema } from '../index';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_ENUM_VALUE } from '../../utility/constant';

/**
 * The disable property
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_ENUM_VALUE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.disable`)
export class Disable extends Property<boolean> {}
