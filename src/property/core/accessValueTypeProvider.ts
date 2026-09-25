import { Meta } from '../../attribute/meta';
import { ReadOnly } from '../common/readOnly';
import { InVisible } from '../common/invisible';
import { FuncCallProperty } from "../funcCallProperty";
import { OfSchema } from "./ofSchema";
import { PropertyValueType } from "./propertyValueType";
import { SchemaType } from "./schemaType";
import { Static } from "./static";

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_CORE, NS_SYSTEM_SCHEMA_FUNC, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_FUNC_CALL } from '../../utility/constant';
import { ForSchema } from './forSchema';

/** The access value provider property */
@Meta(ForSchema, [SCHEMA_KIND_STRING])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_CORE}.AccessValueTypeProvider`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_FUNC_CALL}<${NS_SYSTEM_SCHEMA_FUNC}.valuetype>`)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
export class AccessValueTypeProvider extends FuncCallProperty {}
