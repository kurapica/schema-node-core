import { Meta } from '../../attribute/meta';
import { Relation } from '../../attribute/relation';
import { Assign } from '../../relation/assign';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_SCHEMA_PROPERTY, NS_SYSTEM_SCHEMA_REFLECT_FUNC, NODE_SELF, NS_SYSTEM_LIST, NS_SYSTEM_ENTRY_ACCESS, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_BOOL, SCHEMA_KIND_STRING } from '../../utility/constant';
import { ReadOnly } from '../common/readOnly';
import { InVisible } from '../common/invisible';
import { Valid } from '../constraint/valid';
import { buildFuncCall, FuncCallProperty } from "../funcCallProperty";
import { ForSchema } from "./forSchema";
import { OfSchema } from "./ofSchema";
import { PropertyValueType } from "./propertyValueType";
import { SchemaType } from "./schemaType";
import { Static } from "./static";

/** The access value consumer property */
@Meta(ForSchema, SCHEMA_KIND_STRING)
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.AccessEntryConsumer`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_PROPERTY}.funccall`)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
@Relation(Valid, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.withreturn`, NODE_SELF, NS_SYSTEM_BOOL), "@accessValueTypeConsumer.func")
export class AccessEntryConsumer extends FuncCallProperty {}
