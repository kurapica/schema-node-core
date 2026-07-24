import { Meta } from "../attribute";
import { OfSchema, SchemaType } from "../property";
import { SCHEMA_KIND_OBJECT, NS_SYSTEM_OBJECT } from "../utility";

/** Represents the object type */
@Meta(OfSchema, SCHEMA_KIND_OBJECT)
@Meta(SchemaType, NS_SYSTEM_OBJECT)
class ObjectMeta {}
