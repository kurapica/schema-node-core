// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/AsSuggest.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, PropertyValueType, ForSchema, buildFuncCall, Visible } from '../index';
import { NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_SCHEMA_REFLECT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_ENUM, SCHEMA_KIND_INT, SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRING, SCHEMA_KIND_STRUCT_FIELD } from '../../utility';
import { Relation } from '../../attribute';
import { Call } from '../../relation';

/** The entry list or white list only used as suggestion */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.asSuggest`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Relation(Visible, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT}.isschemakind`, "@type", true, SCHEMA_KIND_ENUM, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING))
export class AsSuggest extends Property<boolean>{}
