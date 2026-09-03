import { Meta } from '../../../attribute/meta';
import { ReadOnly } from '../../../property/common/readOnly';
import { InVisible } from '../../../property/common/invisible';
import { ForSchema } from '../../../property/core/forSchema';
import { OfSchema } from '../../../property/core/ofSchema';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { SchemaType } from '../../../property/core/schemaType';
import { Static } from '../../../property/core/static';
import { Property } from '../../../property/property';

import { SCHEMA_KIND_STRING, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_FUNC, NS_SYSTEM_SCHEMA_PRO_STRING } from '../../../utility/constant';

/** The entry source consumer */
@Meta(ForSchema, [SCHEMA_KIND_STRING])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_STRING}.EntrySourceConsumer`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_FUNC}.funccall`)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
export class EntrySourceConsumer extends Property<boolean>{}