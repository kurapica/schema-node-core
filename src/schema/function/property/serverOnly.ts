import { Property } from "../../../property/property";
import { Meta } from "../../../attribute/meta";
import { OfSchema } from "../../../property/core/ofSchema";
import { SchemaType } from "../../../property/core/schemaType";
import { PropertyValueType } from "../../../property/core/propertyValueType";
import { ForSchema } from "../../../property/core/forSchema";
import { Static } from "../../../property/core/static";
import { ReadOnly } from "../../../property/common/readOnly";
import { InVisible } from "../../../property/common/invisible";

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_FUNC, NS_SYSTEM_BOOL, SCHEMA_KIND_FUNCTION } from "../../../utility/constant";

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(ForSchema, [SCHEMA_KIND_FUNCTION])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_FUNC}.serveronly`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
export class ServerOnly extends Property<boolean> {}
