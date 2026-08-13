import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { ReadOnly } from '../common/readOnly';
import { InVisible } from '../common/invisible';
import { ForSchema } from "./forSchema";
import { OfSchema } from "./ofSchema";
import { PropertyValueType } from "./propertyValueType";
import { SchemaType } from "./schemaType";
import { Static } from "./static";

import { SCHEMA_KIND_STRING, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_SCHEMA_FUNC } from '../../utility/constant';

/** The entry source consumer */
@Meta(ForSchema, [SCHEMA_KIND_STRING])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.EntrySourceConsumer`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_FUNC}.funccall`)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
export class EntrySourceConsumer extends Property<boolean>{}