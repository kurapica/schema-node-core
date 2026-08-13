// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/Attach.cs
// =============================================================================

import { Property } from '../property';
import { ForSchema } from './forSchema';
import { Meta } from '../../attribute/meta';
import { ReadOnly } from '../common/readOnly';
import { SchemaType } from './schemaType';
import { OfSchema } from './ofSchema';
import { PropertyValueType } from './propertyValueType';
import { Static } from './static';

import { NS_SYSTEM_SCHEMA, SCHEMA_KIND_STRUCT, NS_SYSTEM_SCHEMA_PROPERTY_CORE, SCHEMA_KIND_PROPERTY } from '../../utility/constant';

/**
 * Attach the properties of a schema kind to the struct type
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.attach`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA}.kind`)
@Meta(ReadOnly, true)
@Meta(Static, true)
export class Attach extends Property<string> {}
