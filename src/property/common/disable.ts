// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Disable.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { ForSchema } from '../core/forSchema';
import { PropertyValueType } from '../core/propertyValueType';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_ENTRY, NS_SYSTEM_BOOL } from '../../utility/constant';

/**
 * The disable property
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_ENTRY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.disable`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class Disable extends Property<boolean> {}
