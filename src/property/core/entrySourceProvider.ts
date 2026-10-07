import { Meta } from '../../attribute/meta';
import { ReadOnly } from '../common/readOnly';
import { InVisible } from '../common/invisible';
import { FuncCallProperty } from "../funcCallProperty";
import { OfNodeKind } from "./ofNodeKind";
import { PropertyValueType } from "./propertyValueType";
import { SchemaType } from "./schemaType";
import { Static } from "./static";

import { NODE_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_CORE, NS_SYSTEM_SCHEMA_FUNC, NS_SYSTEM_SCHEMA_FUNC_CALL } from '../../utility/constant';

/** The entry source provider */
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_CORE}.EntrySourceProvider`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_FUNC_CALL}<${NS_SYSTEM_SCHEMA_FUNC}.entrysource>`)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
export class EntrySourceProvider extends FuncCallProperty {}
