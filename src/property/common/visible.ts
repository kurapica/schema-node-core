// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Visible.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, PropertyValueType } from '../index';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_BOOL } from '../../utility/constant';

/**
 * The `Visible` property indicates whether a schema node is visible or not. It is a boolean property that can be applied to schema nodes to control their visibility in the user interface or other contexts where visibility is relevant.
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_PROPERTY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.visible`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class Visible extends Property<boolean> {}
