import { Meta } from '../../attribute/meta';
import { Relation } from '../../attribute/relation';
import { ReadOnly } from '../common/readOnly';
import { InVisible } from '../common/invisible';
import { Valid } from '../constraint/valid';
import { FuncCallProperty } from "../funcCallProperty";
import { buildFuncCall } from '../../schema/function/type';
import { ForSchema } from "./forSchema";
import { OfSchema } from "./ofSchema";
import { PropertyValueType } from "./propertyValueType";
import { SchemaType } from "./schemaType";
import { Static } from "./static";

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_SCHEMA_REFLECT_FUNC, NODE_SELF, NS_SYSTEM_BOOL, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_FUNC } from '../../utility/constant';

/** The access value consumer property */
@Meta(ForSchema, SCHEMA_KIND_STRING)
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.AccessEntryConsumer`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_FUNC}.funccall`)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
@Relation(Valid,'assign', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.withreturn`, NODE_SELF, NS_SYSTEM_BOOL), "accessValueTypeConsumer.func")
export class AccessEntryConsumer extends FuncCallProperty {}
