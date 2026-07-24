import { Meta } from "../attribute";
import { OfSchema, SchemaType } from "../property";
import { SCHEMA_KIND_BOOL, NS_SYSTEM_BOOL } from "../utility";

/** Represents the boolean type */
@Meta(OfSchema, SCHEMA_KIND_BOOL)
@Meta(SchemaType, NS_SYSTEM_BOOL)
class BoolMeta {}