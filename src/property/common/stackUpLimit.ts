// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/StackUpLimit.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, ForSchema, PropertyValueType } from '../index';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_BOOL } from '../../utility/constant';

/**
 * When calcuating the stack up limit of a struct, this property indicates whether the origin value should be included in the calculation.
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.StackUpLimit`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class StackUpLimit extends Property<boolean> {}
