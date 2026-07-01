// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Immutable.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, ForSchema } from '../index';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, SCHEMA_KIND_STRUCT_FIELD } from '../../utility/constant';

/**
 * The `Immutable` property indicates whether a field is immutable, meaning that its value cannot be changed after it has been set. 
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.immutable`)
export class Immutable extends Property<boolean> {}
