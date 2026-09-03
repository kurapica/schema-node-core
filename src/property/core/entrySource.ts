import { FuncCallProperty } from '../funcCallProperty';
import { buildFuncCall } from '../../schema/function/type';
import { Meta } from '../../attribute/meta';
import { OfSchema } from './ofSchema';
import { ForSchema } from './forSchema';
import { SchemaType } from './schemaType';
import { PropertyValueType } from './propertyValueType';
import { Relation } from '../../attribute/relation';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_CORE, NODE_SELF, NS_SYSTEM_SCHEMA_REFLECT_FUNC, NS_SYSTEM_LIST, NS_SYSTEM_ENTRY_ACCESS, NS_SYSTEM_SCHEMA_FUNC, NS_SYSTEM_SCHEMA_PRO_COMMON, SCHEMA_KIND_FUNC_ARG, NS_SYSTEM_BOOL } from '../../utility/constant';
import { Property } from '../property';
import { Static } from './static';
import { InVisible, ReadOnly } from '../common';

/** The entry source function */
@Meta(ForSchema, [SCHEMA_KIND_PROPERTY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_CORE}.entrysource`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_FUNC}.funccall`)
@Relation(`${NS_SYSTEM_SCHEMA_PRO_COMMON}.valid`,'assign', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.withreturn`, NODE_SELF, `${NS_SYSTEM_LIST}<${NS_SYSTEM_ENTRY_ACCESS}>`, true), "entrySource.func")
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