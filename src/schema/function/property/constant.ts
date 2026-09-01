import { Property } from "../../../property/property";
import { Meta } from "../../../attribute/meta";
import { OfSchema } from "../../../property/core/ofSchema";
import { SchemaType } from "../../../property/core/schemaType";
import { PropertyValueType } from "../../../property/core/propertyValueType";

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_FUNC, NS_SYSTEM_OBJECT } from "../../../utility/constant";

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_FUNC}.constant`)
@Meta(PropertyValueType, NS_SYSTEM_OBJECT)
export class Constant extends Property<unknown> {}
