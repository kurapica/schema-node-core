// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Suggest.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, PropertyValueType, ForSchema, Alias, Entry } from '../index';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_ENTRY, SCHEMA_KIND_STRING, NS_SYSTEM_LIST, SCHEMA_KIND_INT, NS_SYSTEM_STRING, NS_SYSTEM_INT, NS_SYSTEM_ENTRYS } from '../../utility/constant';

/**
 * Declare a property that suggests a list of entries for a string property.
 */
@Meta(Alias, 'suggest')
@Meta(ForSchema, [SCHEMA_KIND_STRING])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.stringsuggest`)
@Meta(PropertyValueType, `${NS_SYSTEM_ENTRYS}<${NS_SYSTEM_STRING}>`)
export class StringSuggest extends Property<Entry<string>[]> {}

/**
 * Declare a property that suggests a list of entries for an integer property.
 */
@Meta(Alias, 'suggest')
@Meta(ForSchema, [SCHEMA_KIND_INT])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.intsuggest`)
@Meta(PropertyValueType, `${NS_SYSTEM_ENTRYS}<${NS_SYSTEM_INT}>`)
export class IntSuggest extends Property<Entry<number>[]> {}
