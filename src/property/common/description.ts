// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Description.cs
// =============================================================================

import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_LOCALE_STRING } from '../../utility/constant';
import { Display } from './display';

/**
 * The Description property
 */
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.description`)
@Meta(PropertyValueType, NS_SYSTEM_LOCALE_STRING)
export class Description extends Display{}
