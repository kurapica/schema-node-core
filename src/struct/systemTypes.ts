// =============================================================================
// System struct & scalar type definitions — with @Meta decorators for auto-registration
// =============================================================================

import { Meta } from '../attribute/meta';
import { Generics, OfSchema, SchemaType } from '../property/index';
import {
  SCHEMA_KIND_STRUCT, SCHEMA_KIND_STRING, SCHEMA_KIND_INT,
  NS_SYSTEM_STRING, NS_SYSTEM_IDENTIFIER, NS_SYSTEM_INT,
  NS_SYSTEM_LOCALE_STRING, NS_SYSTEM_LOCALE_TRAN,
  NS_SYSTEM_LANGUAGE, NS_SYSTEM_DATE, NS_SYSTEM_FULL_DATE,
  NS_SYSTEM_YEARMONTH,
} from '../utility/constant';

// ── Struct Types ───────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_STRUCT)
@Meta(SchemaType, NS_SYSTEM_LOCALE_TRAN)
export class SystemLocaleTran {
  @Meta(SchemaType, NS_SYSTEM_LANGUAGE)
  lang!: string;

  @Meta(SchemaType, NS_SYSTEM_STRING)
  tran!: string;
}

@Meta(OfSchema, SCHEMA_KIND_STRUCT)
@Meta(SchemaType, NS_SYSTEM_LOCALE_STRING)
export class SystemLocaleString {
  /** The key */
  @Meta(SchemaType, NS_SYSTEM_STRING)
  key!: string;

  /** The translations */
  @Meta(SchemaType, `${NS_SYSTEM_LOCALE_TRAN}s`) // trans array
  trans!: SystemLocaleTran[];

  /** Concat the other locale string */
  concat(other: SystemLocaleString): SystemLocaleString {
    if (other == null) return this;
    this.key = this.key == null || this.key.length === 0 ? other.key : this.key;
  
    // Combine trans
    if (this.trans == null || this.trans.length === 0)
        this.trans = other.trans;
    else if (other.trans != null && other.trans.length > 0)
    {
        for (let tran of this.trans)
        {
            let inOther = other.trans.find(t => t.lang === tran.lang);
            if (inOther != null)
                tran.tran = inOther.tran == null || inOther.tran.trim() === '' ? tran.tran : inOther.tran;
        }
        var otherOnly = other.trans.filter(t => !this.trans.some(a => a.lang === t.lang));
        if (otherOnly.length > 0)
            this.trans = this.trans.concat(otherOnly);
    }

    return this;
  }
}

@Meta(OfSchema, SCHEMA_KIND_STRUCT)
@Meta(SchemaType, 'system.rangedate')
export class SystemRangeDate {
  @Meta(SchemaType, NS_SYSTEM_DATE)
  start!: string;

  @Meta(SchemaType, NS_SYSTEM_DATE)
  stop!: string;
}

/** The entry struct */
@Meta(OfSchema, SCHEMA_KIND_STRUCT)
@Meta(SchemaType, 'system.entry')
@Meta(Generics, [{ name: 'T' }])
export class SystemEntry<T> {
  /** The value of the entry */
  @Meta(SchemaType, "T")
  value!: T;

  /** Localized label for the entry */
  @Meta(SchemaType, NS_SYSTEM_LOCALE_STRING)
  label!: SystemLocaleString;

  /** Has children entries */
  hasChildren: boolean = false;
}

// ── Scalar Types ───────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_IDENTIFIER)
export class SystemIdentifier {}

@Meta(OfSchema, SCHEMA_KIND_INT)
@Meta(SchemaType, 'system.year')
export class SystemYear {}

@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, 'system.guid')
export class SystemGuid {}

// ── Aggregate exports for scanning ─────────────────────────────────────────

export const systemStructTypes = [
  SystemLocaleTran, SystemLocaleString, SystemRangeDate,
];

export const systemScalarTypes = [
  SystemIdentifier, SystemYear, SystemGuid,
];
