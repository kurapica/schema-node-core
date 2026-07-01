// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Unit.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, PropertyValueType } from '../index';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_PROPERTY_COMMON } from '../../utility/constant';
import { SystemLocaleString } from '../../struct/systemTypes';

/**
 * The unit property is used to define the unit of measurement
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.unit`)
export class Unit extends Property<SystemLocaleString> {}
