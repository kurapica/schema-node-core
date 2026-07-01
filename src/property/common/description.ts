// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Description.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType } from '../index';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_NODE, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_SCHEMA_PROPERTY_COMMON } from '../../utility/constant';
import { SystemLocaleString } from '../../struct/systemTypes';

/**
 * The Description property
 */
@Meta(ForSchema, [SCHEMA_KIND_NODE, SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.description`)
export class Description extends Property<SystemLocaleString> {}
