// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/AsSuggest.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';

import { NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, SCHEMA_KIND_PROPERTY } from '../../utility/constant';

/** The entry list or white list only used as suggestion */
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.assuggest`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class AsSuggest extends Property<boolean>{}
