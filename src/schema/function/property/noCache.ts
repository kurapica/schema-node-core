import { Property } from "../../../property/property";
import { Meta } from "../../../attribute/meta";
import { OfSchema } from "../../../property/core/ofSchema";
import { SchemaType } from "../../../property/core/schemaType";
import { PropertyValueType } from "../../../property/core/propertyValueType";

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_FUNC, NS_SYSTEM_BOOL, SCHEMA_KIND_FUNCTION } from "../../../utility/constant";
import { Static } from "../../../property/core/static";
import { ReadOnly } from "../../../property/common/readOnly";
import { InVisible } from "../../../property/common/invisible";
import { ForSchema } from "../../../property/core/forSchema";

@Meta(ForSchema, SCHEMA_KIND_FUNCTION)
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_FUNC}.nocache`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
export class NoCache extends Property<boolean> {}
