// =============================================================================
// Attach — attach properties from another schema kind to this one
// =============================================================================

import { Property } from '../property';
import { ForSchema } from './forSchema';
import { NS_SYSTEM_SCHEMA, SCHEMA_KIND_STRUCT, NS_SYSTEM_SCHEMA_PROPERTY_CORE, SCHEMA_KIND_PROPERTY } from '../../utility/constant';
import { Meta } from '../../attribute/meta';
import { ReadOnly } from '../common/readOnly';
import { SchemaType } from './schemaType';
import { OfSchema, PropertyValueType, Static } from '../..';

@Meta(ForSchema, SCHEMA_KIND_STRUCT)
@Meta(ReadOnly, true)
@Meta(Static, true)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.attach`)
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA}.kind`)
export class Attach extends Property<string> {}
