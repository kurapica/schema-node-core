// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/OverrideType.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, PropertyValueType, Visible } from '../index';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_SCHEMA_PROPERTY_CORE } from '../../utility/constant';

/**
 * OverrideType is a property that allows overriding the field type with a different schema name.
 * It is decorated with metadata to specify its schema kind and associated properties.
 */
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(Visible, false)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.OverrideType`)
@Meta(PropertyValueType, `{NS_SYSTEM_SCHEMA_NODE}.valuetype`)
export class OverrideType extends Property<string> {}
