import { ForSchema, Property } from "..";
import { Meta } from "../../attribute/meta";
import { SCHEMA_KIND_STRUCT_FIELD } from "../../utility/constant";

/** The name property for struct field */
export class Name extends Property<string>{}