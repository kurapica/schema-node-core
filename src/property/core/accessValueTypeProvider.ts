import { Meta, Relation } from "../../attribute";
import { Assign } from "../../relation";
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_SCHEMA_PROPERTY, NS_SYSTEM_SCHEMA_REFLECT_FUNC, NODE_SELF, NS_SYSTEM_LIST, NS_SYSTEM_ENTRY_ACCESS, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE } from "../../utility";
import { ReadOnly, InVisible } from "../common";
import { Valid } from "../constraint";
import { buildFuncCall, FuncCallProperty } from "../funcCallProperty";
import { OfSchema } from "./ofSchema";
import { PropertyValueType } from "./propertyValueType";
import { SchemaType } from "./schemaType";
import { Static } from "./static";

/** The access value provider property */
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.AccessValueTypeProvider`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_PROPERTY}.funccall`)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
@Relation(Valid, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.withreturn`, NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE), "@AccessValueTypeProvider.func")
export class AccessValueTypeProvider extends FuncCallProperty {}
