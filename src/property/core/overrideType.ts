// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/OverrideType.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { Alias } from './alias';
import { OfNodeKind } from './ofNodeKind';
import { ForSchema } from './forSchema';
import { SchemaType } from './schemaType';
import { PropertyValueType } from './propertyValueType';
import { Visible } from '../common/visible';

import { SCHEMA_KIND_NODE_PROPERTY, NS_SYSTEM_SCHEMA_PRO_CORE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NODE_KIND_PROPERTY } from '../../utility/constant';

/** OverrideType is a property that allows overriding the field type with a different schema name. */
@Meta(Alias, 'overrideType')
@Meta(ForSchema, [SCHEMA_KIND_NODE_PROPERTY])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(Visible, false)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_CORE}.overridetype`)
@Meta(PropertyValueType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
export class OverrideType extends Property<string> {}
