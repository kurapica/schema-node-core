// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/ReadOnly.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType } from '../index';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_SCHEMA_PROPERTY_COMMON } from '../../utility/constant';

/**
 * The `ReadOnly` property indicates whether a field is read-only, meaning that its value cannot be modified by the user.
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_PROPERTY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.readonly`)
export class ReadOnly extends Property<boolean> {}
