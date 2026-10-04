import { Meta } from "../../attribute/meta";
import { Property } from "../property";
import { OfNodeKind } from "./ofNodeKind";
import { PropertyValueType } from "./propertyValueType";
import { SchemaType } from "./schemaType";
import { Static } from "./static";

import { NS_SYSTEM_SCHEMA_PRO_CORE, NS_SYSTEM_STRING, NODE_KIND_PROPERTY } from "../../utility/constant";
import { ReadOnly } from "../common/readOnly";
import { InVisible } from "../common/invisible";

/** The type provider property. */
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_CORE}.typeprovider`)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
export class TypeProvider extends Property<string>{}