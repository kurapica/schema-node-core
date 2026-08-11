// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Invisible.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { ForSchema } from '../core/forSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_BOOL } from '../../utility/constant';

/**
 * The invisible property is used to indicate that a property or field should not be visible in certain contexts, such as user interfaces or documentation. It can be applied to both properties and struct fields.
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_PROPERTY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.invisible`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class InVisible extends Property<boolean> {}
