import { Meta } from "../../attribute/meta";
import { OfSchema } from '../../property/core/ofSchema';
import { Require } from '../../property/constraint/require';
import { SchemaType } from '../../property/core/schemaType';
import { SCHEMA_KIND_STRUCT, NS_SYSTEM_LOCALE_STRING, NS_SYSTEM_STRING, NS_SYSTEM_LOCALE_TRAN } from "../../utility/constant";
import { NS_SYSTEM_LANGUAGE } from "../../utility/constant";
import type { LocaleString, LocaleTran } from "./type";

@Meta(OfSchema, SCHEMA_KIND_STRUCT)
@Meta(SchemaType, NS_SYSTEM_LOCALE_TRAN)
class LocaleTranMeta implements LocaleTran {
  /** The language */
  @Meta(SchemaType, NS_SYSTEM_LANGUAGE)
  lang!: string;

  /** The translation */
  @Meta(SchemaType, NS_SYSTEM_STRING)
  tran!: string;
}

@Meta(OfSchema, SCHEMA_KIND_STRUCT)
@Meta(SchemaType, NS_SYSTEM_LOCALE_STRING)
class LocaleStringMeta implements LocaleString {
  /** The key */
  @Meta(SchemaType, NS_SYSTEM_STRING)
  @Meta(Require, true)
  key!: string;

  /** The translations */
  @Meta(SchemaType, `${NS_SYSTEM_LOCALE_TRAN}s`) // trans array
  trans?: LocaleTran[];
}