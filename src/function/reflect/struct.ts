import { Meta } from "../../attribute";
import { OfSchema, SchemaType } from "../../property";
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_SCHEMA_REFLECT_STRUCT } from "../../utility";

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_REFLECT_STRUCT)
export class SystemReflectStruct {
}