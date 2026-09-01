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

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_SCHEMA_REFLECT_FUNC, NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_FUNC } from '../../utility/constant';

/** The access value provider property */
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.AccessValueTypeProvider`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_FUNC}.funccall`)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
@Relation(Valid,'assign', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.withreturn`, NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE), "accessValueTypeProvider.func")
export class AccessValueTypeProvider extends FuncCallProperty {}
