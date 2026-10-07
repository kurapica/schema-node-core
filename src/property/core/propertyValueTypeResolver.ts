import { Meta } from "../../attribute";
import { Property } from "../property";
import { ForSchema } from "./forSchema";
import { OfNodeKind } from "./ofNodeKind";
import { SchemaType } from "./schemaType";
import { Static } from "./static";
import { ReadOnly } from "../common/readOnly";
import { InVisible } from "../common/invisible";
import { PropertyValueType } from "./propertyValueType";

import { NODE_KIND_PROPERTY, NS_SYSTEM_SCHEMA_FUNC_TYPE, NS_SYSTEM_SCHEMA_PRO_CORE, SCHEMA_KIND_NODE_PROPERTY } from "../../utility/constant";

/** The property type resolver */
@Meta(ForSchema, SCHEMA_KIND_NODE_PROPERTY)
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_CORE}.PropertyTypeResolver`)
@Meta(PropertyValueType, NS_SYSTEM_SCHEMA_FUNC_TYPE)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
export class PropertyValueTypeResolver extends Property<string>{}
