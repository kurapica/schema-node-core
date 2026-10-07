import { Meta } from '../../../attribute/meta';
import { Alias } from '../../../property/core/alias';
import { ReadOnly } from '../../../property/common/readOnly';
import { InVisible } from '../../../property/common/invisible';
import { ForSchema } from '../../../property/core/forSchema';
import { OfNodeKind } from '../../../property/core/ofNodeKind';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { SchemaType } from '../../../property/core/schemaType';
import { Static } from '../../../property/core/static';
import { Property } from '../../../property/property';

import { SCHEMA_KIND_NODE_STRING, NODE_KIND_PROPERTY, NS_SYSTEM_SCHEMA_FUNC, NS_SYSTEM_SCHEMA_PRO_STRING } from '../../../utility/constant';

/** The entry source consumer */
@Meta(Alias, 'entrySourceConsumer')
@Meta(ForSchema, [SCHEMA_KIND_NODE_STRING])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_STRING}.EntrySourceConsumer`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_FUNC}.funccall`)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
export class EntrySourceConsumer extends Property<boolean>{}