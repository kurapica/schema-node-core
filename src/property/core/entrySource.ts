import { buildFuncCall, FuncCallProperty } from '../funcCallProperty';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, Valid, PropertyValueType } from '../index';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_ENTRY, NODE_SELF, NS_SYSTEM_SCHEMA_REFLECT_FUNC, NS_SYSTEM_LIST, NS_SYSTEM_SCHEMA_PROPERTY } from '../../utility/constant';
import { Relation } from '../../attribute/relation';
import { Assign } from '../../relation/assign';

/**
 * The white list declaration of the data
 */
@Meta(ForSchema, [SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.entrysource`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_PROPERTY}.funccall`)
@Relation(Valid, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.withreturn`, NODE_SELF, `${NS_SYSTEM_LIST}<${NS_SYSTEM_ENTRY}>`, true), "@entrySource.func")
export class EntrySource extends FuncCallProperty {}
