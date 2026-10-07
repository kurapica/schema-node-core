// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Disable.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { Alias } from '../core/alias';
import { OfNodeKind } from '../core/ofNodeKind';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';

import { NODE_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_COMMON, NS_SYSTEM_BOOL } from '../../utility/constant';

/**
 * The disable property
 */
@Meta(Alias, 'disable')
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_COMMON}.disable`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class Disable extends Property<boolean> {}
