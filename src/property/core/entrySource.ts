import { FuncCallProperty } from '../funcCallProperty';
import { Meta } from '../../attribute/meta';
import { OfSchema } from './ofSchema';
import { ForSchema } from './forSchema';
import { SchemaType } from './schemaType';
import { PropertyValueType } from './propertyValueType';
import { Property } from '../property';
import { Static } from './static';
import { ReadOnly } from '../common/readOnly';
import { InVisible } from '../common/invisible';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_CORE, NS_SYSTEM_SCHEMA_FUNC, SCHEMA_KIND_FUNC_ARG, NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_FUNC_CALL } from '../../utility/constant';

/** The entry source function */
@Meta(ForSchema, [SCHEMA_KIND_PROPERTY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_CORE}.entrysource`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_FUNC_CALL}<${NS_SYSTEM_SCHEMA_FUNC}.entrysource>`)
export class EntrySource extends FuncCallProperty {}

/** The entry root tag for function argument */
@Meta(ForSchema, [SCHEMA_KIND_FUNC_ARG])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_CORE}.entryroot`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
export class EntryRoot extends Property<boolean> {}

/** The entry source version used to notify the view force rebuild the options */
export class EntrySourceVersion extends Property<number> {}