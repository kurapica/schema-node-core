import type { EnumValueTypeValue } from "../../enum/enumValueType";
import type { Entry } from "../../struct/entry/type";
import type { LocaleString } from "../../struct/localeString/type";

/** The enum schema */
export interface EnumSchema {
  /** The enum value type */
  type: EnumValueTypeValue;

  /** The cascade of the enum value */
  cascade?: LocaleString[];
  
  /** The root enum values */
  values: Entry<string>[];
}
