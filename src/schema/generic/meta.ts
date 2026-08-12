import { Meta } from "../../attribute/meta";
import { RuntimeNodeType, SchemaKind } from "../../property";
import { SchemaType } from "../../property/core/schemaType";
import { NS_SYSTEM_LIST, NS_SYSTEM_SCHEMA_NODE, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_STRING, SCHEMA_KIND_GENERIC, SCHEMA_KIND_ORDER_GENERIC } from "../../utility/constant";
import { GenericType } from "./runtime";

@Meta(SchemaKind, [SCHEMA_KIND_GENERIC, SCHEMA_KIND_ORDER_GENERIC])
@Meta(RuntimeNodeType, GenericType)
class GenericKind {}

/** A single generic type parameter declaration. */
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.genericParameter`)
class GenericParameterMeta {
  @Meta(SchemaType, NS_SYSTEM_STRING)
  name: string = "T";

  @Meta(SchemaType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_SCHEMA_NODE}.valuetype>`)
  compatibles?: string[];
}