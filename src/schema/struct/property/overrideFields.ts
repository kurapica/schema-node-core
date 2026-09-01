// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/OverrideFields.cs
// =============================================================================

import { Property } from '../../../property/property';
import { Meta } from '../../../attribute/meta';
import { OfSchema } from '../../../property/core/ofSchema';
import { ForSchema } from '../../../property/core/forSchema';
import { SchemaType } from '../../../property/core/schemaType';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { Visible } from '../../../property/common/visible';

import type { StructFieldSchema } from '../type';

import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_SCHEMA_STRUCT_FIELD, NS_SYSTEM_SCHEMA_PROPERTY_STRUCT } from '../../../utility/constant';

/** OverrideFields is a property that allows overriding the field type with a different schema name. */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(Visible, false)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_STRUCT}.OverrideFields`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_STRUCT_FIELD}.schemas`)
export class OverrideFields extends Property<StructFieldSchema[]> {}
