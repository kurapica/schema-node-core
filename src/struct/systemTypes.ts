// =============================================================================
// System struct & scalar type definitions — with @Meta decorators for auto-registration
// =============================================================================

import { Meta } from '../attribute/meta';
import { OfSchema, SchemaType } from '../property/index';
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
  @Meta(SchemaType, NS_SYSTEM_STRING)
  key!: string;

  @Meta(SchemaType, NS_SYSTEM_LOCALE_STRING) // trans array
  trans!: string;
}

@Meta(OfSchema, SCHEMA_KIND_STRUCT)
@Meta(SchemaType, 'system.rangedate')
export class SystemRangeDate {
  @Meta(SchemaType, NS_SYSTEM_DATE)
  start!: string;

  @Meta(SchemaType, NS_SYSTEM_DATE)
  stop!: string;
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
