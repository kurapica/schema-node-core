import { Meta } from "../../attribute/meta";
import { Alias } from "./alias";
import { Property } from "../property";
import { OfNodeKind } from "./ofNodeKind";
import { PropertyValueType } from "./propertyValueType";
import { SchemaType } from "./schemaType";
import { Static } from "./static";

import { NS_SYSTEM_SCHEMA_PRO_CORE, NS_SYSTEM_STRING, NODE_KIND_PROPERTY } from "../../utility/constant";
import { ReadOnly } from "../common/readOnly";
import { InVisible } from "../common/invisible";

/** The schema kind provider property. */
@Meta(Alias, 'kindProvider')
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_CORE}.kindprovider`)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
export class KindProvider extends Property<string>{}
