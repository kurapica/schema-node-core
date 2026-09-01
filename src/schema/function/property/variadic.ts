import { Property } from "../../../property/property";
import { Meta } from "../../../attribute/meta";
import { OfSchema } from "../../../property/core/ofSchema";
import { SchemaType } from "../../../property/core/schemaType";
import { PropertyValueType } from "../../../property/core/propertyValueType";
import { ForSchema } from "../../../property/core/forSchema";
import { InVisible } from "../../../property/common/invisible";

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_FUNC, NS_SYSTEM_BOOL, SCHEMA_KIND_FUNC_ARG } from "../../../utility/constant";

@Meta(ForSchema, [SCHEMA_KIND_FUNC_ARG])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_FUNC}.variadic`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(InVisible, true) // @TODO: maybe we'll support custom function with variadic arguments
export class Variadic extends Property<boolean> {};