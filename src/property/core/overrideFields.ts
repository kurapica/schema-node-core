// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/OverrideFields.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema } from './ofSchema';
import { ForSchema } from './forSchema';
import { SchemaType } from './schemaType';
import { PropertyValueType } from './propertyValueType';
import { Visible } from '../common/visible';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE } from '../../utility/constant';
import { StructFieldSchema } from '../../schema/structSchema';

/** OverrideFields is a property that allows overriding the field type with a different schema name. */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(Visible, false)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.OverrideFields`)
@Meta(PropertyValueType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
export class OverrideFields extends Property<StructFieldSchema[]> {}
