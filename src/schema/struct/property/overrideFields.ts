// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/OverrideFields.cs
// =============================================================================

import { Property } from '../../../property/property';
import { Meta } from '../../../attribute/meta';
import { OfNodeKind } from '../../../property/core/ofNodeKind';
import { ForSchema } from '../../../property/core/forSchema';
import { SchemaType } from '../../../property/core/schemaType';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { Visible } from '../../../property/common/visible';

import type { StructFieldSchema } from '../type';

import { NODE_KIND_PROPERTY, SCHEMA_KIND_NODE_STRUCT_FIELD, NS_SYSTEM_SCHEMA_STRUCT_FIELD, NS_SYSTEM_SCHEMA_PRO_STRUCT } from '../../../utility/constant';

/** OverrideFields is a property that allows overriding the field type with a different schema name. */
@Meta(ForSchema, [SCHEMA_KIND_NODE_STRUCT_FIELD])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(Visible, false)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_STRUCT}.OverrideFields`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_STRUCT_FIELD}.schemas`)
export class OverrideFields extends Property<StructFieldSchema[]> {}
