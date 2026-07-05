import { Meta } from "../attribute/meta";
import { OfSchema, SchemaType } from "../property";
import { SCHEMA_KIND_STRUCT, NS_SYSTEM_LOCALE_TRAN, NS_SYSTEM_LANGUAGE, NS_SYSTEM_STRING } from "../utility/constant";

/** The locale translation */
export interface LocaleTran {
  /** The language */
  lang: string;

  /** The translation */
  tran: string;
}

@Meta(OfSchema, SCHEMA_KIND_STRUCT)
@Meta(SchemaType, NS_SYSTEM_LOCALE_TRAN)
class LocaleTranMeta {
  /** The language */
  @Meta(SchemaType, NS_SYSTEM_LANGUAGE)
  lang!: string;

  /** The translation */
  @Meta(SchemaType, NS_SYSTEM_STRING)
  tran!: string;
}