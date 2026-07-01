// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/DisplayOnly.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, ForSchema } from '../index';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_BOOL, SCHEMA_KIND_STRUCT_FIELD } from '../../utility/constant';

/**
 * The struct field is display only, meaning it is not editable in the UI and is not persisted to the database.
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.displayonly`)
export class DisplayOnly extends Property<boolean> {}
