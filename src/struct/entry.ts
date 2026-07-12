import { Meta } from "../attribute/meta";
import { OfSchema, SchemaType, Generics } from "../property";
import { SCHEMA_KIND_STRUCT, NS_SYSTEM_LOCALE_STRING } from "../utility/constant";
import { LocaleString } from "./localeString";

export interface Entry<T> {
    /** The entry value */
    value: T;

    /** The label of the entry */
    label: LocaleString;

    /** Whether has child entries */
    hasChildren: boolean;
}

/** The entry struct */
@Meta(OfSchema, SCHEMA_KIND_STRUCT)
@Meta(SchemaType, 'system.entry')
@Meta(Generics, [{ name: 'T' }])
class EntryMeta<T> implements Entry<T> {
  /** The value of the entry */
  @Meta(SchemaType, "T")
  value!: T;

  /** Localized label for the entry */
  @Meta(SchemaType, NS_SYSTEM_LOCALE_STRING)
  label!: LocaleString;

  /** Has children entries */
  hasChildren: boolean = false;
}
