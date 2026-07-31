// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/AsSuggest.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, PropertyValueType, ForSchema } from '../index';
import { NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_INT, SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRING } from '../../utility';

/** The entry list or white list only used as suggestion */
@Meta(ForSchema, [SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.asSuggest`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class AsSuggest extends Property<boolean>{}
