// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/OverrideType.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, PropertyValueType, Visible } from '../index';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE } from '../../utility/constant';
import { IValueAccess } from '../../runtime';

/**
 * OverrideType is a property that allows overriding the field type with a different schema name.
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(Visible, false)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.OverrideType`)
@Meta(PropertyValueType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
export class OverrideType extends Property<string> {}
