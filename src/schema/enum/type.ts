import { EnumValueTypeValue } from "../../enum/enumValueType";
import { Entry } from "../../struct/entry";
import { LocaleString } from "../../struct/localeString";

/** The enum schema */
export interface EnumSchema {
  /** The enum value type */
  type: EnumValueTypeValue;

  /** The cascade of the enum value */
  cascade?: LocaleString[];
  
  /** The root enum values */
  values: Entry<string>[];
}
