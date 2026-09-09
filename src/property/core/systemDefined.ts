import { Meta } from "../../attribute/meta";
import { Property } from "../property";
import { OfSchema } from "./ofSchema";
import { PropertyValueType } from "./propertyValueType";
import { SchemaType } from "./schemaType";
import { Static } from "./static";

import { NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_PRO_CORE, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY } from "../../utility/constant";
import { ReadOnly } from "../common/readOnly";
import { InVisible } from "../common/invisible";
import { ForSchema } from "./forSchema";
import { Alias } from "./alias";

/** The system defined property. */
@Meta(Alias, 'system')
@Meta(ForSchema, SCHEMA_KIND_NODE)
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_CORE}.systemdefined`)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class SystemDefined extends Property<boolean>{}