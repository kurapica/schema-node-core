// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/StackUpLimit.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, ForSchema } from '../index';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, SCHEMA_KIND_STRUCT_FIELD } from '../../utility/constant';

/**
 * When calcuating the stack up limit of a struct, this property indicates whether the origin value should be included in the calculation.
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.stackuplimit`)
export class StackUpLimit extends Property<boolean> {}
