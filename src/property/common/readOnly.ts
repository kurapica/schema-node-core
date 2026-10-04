// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/ReadOnly.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfNodeKind } from '../core/ofNodeKind';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';

import { SCHEMA_KIND_NODE_PROPERTY, NS_SYSTEM_SCHEMA_PRO_COMMON, NS_SYSTEM_BOOL, NODE_KIND_PROPERTY } from '../../utility/constant';
import { ForSchema } from '../core/forSchema';

/** The `ReadOnly` property indicates whether a field is read-only, meaning that its value cannot be modified by the user. */
@Meta(ForSchema, [SCHEMA_KIND_NODE_PROPERTY])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_COMMON}.ReadOnly`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class ReadOnly extends Property<boolean> {}
