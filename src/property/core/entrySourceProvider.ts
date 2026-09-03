import { Meta } from '../../attribute/meta';
import { Relation } from '../../attribute/relation';
import { ReadOnly } from '../common/readOnly';
import { InVisible } from '../common/invisible';
import { Valid } from '../common/valid';
import { FuncCallProperty } from "../funcCallProperty";
import { buildFuncCall } from '../../schema/function/type';
import { OfSchema } from "./ofSchema";
import { PropertyValueType } from "./propertyValueType";
import { SchemaType } from "./schemaType";
import { Static } from "./static";

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_CORE, NS_SYSTEM_SCHEMA_REFLECT_FUNC, NODE_SELF, NS_SYSTEM_LIST, NS_SYSTEM_ENTRY_ACCESS, NS_SYSTEM_SCHEMA_FUNC } from '../../utility/constant';

/** The entry source provider */
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_CORE}.EntrySourceProvider`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_FUNC}.funccall`)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
@Relation(Valid,'assign', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.withreturn`, NODE_SELF, `${NS_SYSTEM_LIST}<${NS_SYSTEM_ENTRY_ACCESS}>`, true), "entrySourceProvider.func")
export class EntrySourceProvider extends FuncCallProperty {}
