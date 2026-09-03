// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/StackUpLimit.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_COMMON, NS_SYSTEM_BOOL } from '../../utility/constant';

/**
 * When calcuating the stack up limit of a struct, this property indicates whether the origin value should be included in the calculation.
 */
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_COMMON}.StackUpLimit`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class StackUpLimit extends Property<boolean> {}
