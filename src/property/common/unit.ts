// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Unit.cs
// =============================================================================

import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_LOCALE_STRING } from '../../utility/constant';
import { Display } from './display';

/**
 * The unit property is used to define the unit of measurement
 */
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.Unit`)
@Meta(PropertyValueType, NS_SYSTEM_LOCALE_STRING)
export class Unit extends Display{}