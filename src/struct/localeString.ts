import { Meta } from "../attribute/meta";
import { OfSchema, Require, SchemaType } from "../property";
import { SCHEMA_KIND_STRUCT, NS_SYSTEM_LOCALE_STRING, NS_SYSTEM_STRING, NS_SYSTEM_LOCALE_TRAN } from "../utility/constant";
import { LocaleTran } from "./localeTran";

/** The locale string */
export interface LocaleString {
    /** The key */
    key: string;

    /** The translations */
    trans?: LocaleTran[];
}

  /** Concat the other locale string */
export function concatLocaleString(left: LocaleString, right: LocaleString): LocaleString {
    if (right == null) return left;
    left.key = left.key == null || left.key.length === 0 ? right.key : left.key;
  
    // Combine trans
    if (left.trans == null || left.trans.length === 0)
        left.trans = right.trans;
    else if (right.trans != null && right.trans.length > 0)
    {
        for (let tran of left.trans)
        {
            let inOther = right.trans.find(t => t.lang === tran.lang);
            if (inOther != null)
                tran.tran = inOther.tran == null || inOther.tran.trim() === '' ? tran.tran : inOther.tran;
        }
        var otherOnly = right.trans.filter(t => !left.trans.some(a => a.lang === t.lang));
        if (otherOnly.length > 0)
            left.trans = left.trans.concat(otherOnly);
    }
    return left;
  }

@Meta(OfSchema, SCHEMA_KIND_STRUCT)
@Meta(SchemaType, NS_SYSTEM_LOCALE_STRING)
class LocaleStringMeta {
  /** The key */
  @Meta(SchemaType, NS_SYSTEM_STRING)
  @Meta(Require, true)
  key!: string;

  /** The translations */
  @Meta(SchemaType, `${NS_SYSTEM_LOCALE_TRAN}s`) // trans array
  trans?: LocaleTran[];
}
