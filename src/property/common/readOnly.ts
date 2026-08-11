// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/ReadOnly.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { ForSchema } from '../core/forSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_BOOL } from '../../utility/constant';

/**
 * The `ReadOnly` property indicates whether a field is read-only, meaning that its value cannot be modified by the user.
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_PROPERTY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.ReadOnly`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class ReadOnly extends Property<boolean> {}
