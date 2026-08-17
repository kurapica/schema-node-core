import { FuncCallProperty } from '../funcCallProperty';
import { buildFuncCall } from '../../schema/function/type';
import { Meta } from '../../attribute/meta';
import { OfSchema } from './ofSchema';
import { ForSchema } from './forSchema';
import { SchemaType } from './schemaType';
import { PropertyValueType } from './propertyValueType';
import { Relation } from '../../attribute/relation';

import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NODE_SELF, NS_SYSTEM_SCHEMA_REFLECT_FUNC, NS_SYSTEM_LIST, NS_SYSTEM_ENTRY_ACCESS, NS_SYSTEM_SCHEMA_FUNC, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, SCHEMA_KIND_ENUM } from '../../utility/constant';
import { Property } from '../property';

/** The entry source function */
@Meta(ForSchema, [SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING, SCHEMA_KIND_ENUM])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.entrysource`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_FUNC}.funccall`)
@Relation(`${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.valid`,'assign', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.withreturn`, NODE_SELF, `${NS_SYSTEM_LIST}<${NS_SYSTEM_ENTRY_ACCESS}>`, true), "entrySource.func")
export class EntrySource extends FuncCallProperty {}

/** The entry source version used to notify the view force rebuild the options */
export class EntrySourceVersion extends Property<number> {}