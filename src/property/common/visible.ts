// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Visible.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { Alias } from '../core/alias';
import { OfNodeKind } from '../core/ofNodeKind';
import { ForSchema } from '../core/forSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { InVisible } from './invisible';

import { SCHEMA_KIND_NODE_PROPERTY, NS_SYSTEM_SCHEMA_PRO_COMMON, NS_SYSTEM_BOOL, NODE_KIND_PROPERTY } from '../../utility/constant';

/**
 * The `Visible` property indicates whether a schema node is visible or not. It is a boolean property that can be applied to schema nodes to control their visibility in the user interface or other contexts where visibility is relevant.
 */
@Meta(Alias, 'visible')
@Meta(ForSchema, [SCHEMA_KIND_NODE_PROPERTY])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_COMMON}.visible`)
@Meta(InVisible, true)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class Visible extends Property<boolean> {}
