import { Meta } from "../../attribute/meta";
import { PropertyValueType } from "../../property";
import { ReadOnly } from "../../property/common/readOnly";
import { ForSchema } from "../../property/core/forSchema";
import { OfSchema } from "../../property/core/ofSchema";
import { SchemaType } from "../../property/core/schemaType";
import { Property } from "../../property/property";

import type { GenericParameter } from "./type";

import { SCHEMA_KIND_STRUCT, SCHEMA_KIND_ARRAY, SCHEMA_KIND_FUNCTION, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_LIST } from "../../utility";

/**
 * A collection of generic type parameter declarations for a schema.
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT, SCHEMA_KIND_ARRAY, SCHEMA_KIND_FUNCTION])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(ReadOnly, true)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.generics`)
@Meta(PropertyValueType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.genericParameter>`)
export class Generics extends Property<GenericParameter[]> {}
