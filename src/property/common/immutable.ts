// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Immutable.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, ForSchema, PropertyValueType, Static } from '../index';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_BOOL } from '../../utility/constant';

/**
 * The `Immutable` property indicates whether a field is immutable, meaning that its value cannot be changed after it has been set. 
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_PROPERTY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.Immutable`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Static, true)
export class Immutable extends Property<boolean> {}
