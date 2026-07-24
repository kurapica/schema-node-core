// =============================================================================
// system.logic — and, or, not, between, cond, isnull, isempty, eq, neq, ge, gt, le, lt
// Mirrors C# SchemaNode.Core/Function/SystemLogic.cs
// =============================================================================

import BigNumber from 'bignumber.js';
import { Meta } from '../attribute/meta';
import { OfSchema, SchemaType, Return, Generics, ArgName, Default, Require } from '../property/index';
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_BOOL, NS_SYSTEM_NUMBER } from '../utility/constant';
import { isNull, isEmpty } from '../utility/toolset';

// ── Helpers ────────────────────────────────────────────────────────────────

function compare<T>(a: T, b: T): number {
  if (a instanceof BigNumber && b instanceof BigNumber) return a.comparedTo(b) ?? 0;
  if (a === b) return 0;
  return (a as unknown as number) < (b as unknown as number) ? -1 : 1;
}

// ── Class ──────────────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, 'system.logic')
export class SystemLogic {
  /** a && b */
  @Meta(Return, NS_SYSTEM_BOOL)
  static and(
    @Meta(ArgName, 'a') @Meta(SchemaType, NS_SYSTEM_BOOL) @Meta(Default, false) a: boolean = false,
    @Meta(ArgName, 'b') @Meta(SchemaType, NS_SYSTEM_BOOL) @Meta(Default, false) b: boolean = false,
  ): boolean { return a && b; }

  /** a || b */
  @Meta(Return, NS_SYSTEM_BOOL)
  static or(
    @Meta(ArgName, 'a') @Meta(SchemaType, NS_SYSTEM_BOOL) @Meta(Default, false) a: boolean = false,
    @Meta(ArgName, 'b') @Meta(SchemaType, NS_SYSTEM_BOOL) @Meta(Default, false) b: boolean = false,
  ): boolean { return a || b; }

  /** !a */
  @Meta(Return, NS_SYSTEM_BOOL)
  static not(@Meta(ArgName, 'a') @Meta(SchemaType, NS_SYSTEM_BOOL) @Meta(Default, false) a: boolean = false): boolean { return !a; }

  /** v in [min, max] */
  @Meta(Return, NS_SYSTEM_BOOL)
  @Meta(Generics, [{ name: 'T', compatibles: [NS_SYSTEM_NUMBER]}])
  static between<T>(
    @Meta(ArgName, 'v') @Meta(SchemaType, 'T') @Meta(Require, true) v: T,
    @Meta(ArgName, 'min') @Meta(SchemaType, 'T') @Meta(Require, true) min: T,
    @Meta(ArgName, 'max') @Meta(SchemaType, 'T') @Meta(Require, true) max: T,
    @Meta(ArgName, 'includeMin') @Meta(SchemaType, NS_SYSTEM_BOOL) includeMin?: boolean,
    @Meta(ArgName, 'includeMax') @Meta(SchemaType, NS_SYSTEM_BOOL) includeMax?: boolean,
  ): boolean {
    const geMin = includeMin ? compare(v, min) >= 0 : compare(v, min) > 0;
    const leMax = includeMax ? compare(v, max) <= 0 : compare(v, max) < 0;
    return geMin && leMax;
  }

  /** cond ? trueValue : falseValue */
  @Meta(Return, 'T')
  @Meta(Generics, [{ name: 'T' }])
  static cond<T>(
    @Meta(ArgName, 'cond') @Meta(SchemaType, NS_SYSTEM_BOOL) @Meta(Default, false) cond: boolean,
    @Meta(ArgName, 'trueValue') @Meta(SchemaType, 'T') @Meta(Require, true) trueValue: T,
    @Meta(ArgName, 'falseValue') @Meta(SchemaType, 'T') @Meta(Require, true) falseValue: T,
  ): T { return cond ? trueValue : falseValue; }

  /** a is null */
  @Meta(Return, NS_SYSTEM_BOOL)
  @Meta(Generics, [{ name: 'T' }])
  static isnull<T>(@Meta(ArgName, 'a') @Meta(SchemaType, 'T') a: T): boolean { return isNull(a); }

  /** a is not null */
  @Meta(Return, NS_SYSTEM_BOOL)
  @Meta(Generics, [{ name: 'T' }])
  static notnull<T>(@Meta(ArgName, 'a') @Meta(SchemaType, 'T') a: T): boolean { return !isNull(a); }

  /** a is empty */
  @Meta(Return, NS_SYSTEM_BOOL)
  static isempty(@Meta(ArgName, 'a') @Meta(SchemaType, 'system.object') a: unknown): boolean { return isEmpty(a); }

  /** a is not empty */
  @Meta(Return, NS_SYSTEM_BOOL)
  static notempty(@Meta(ArgName, 'a') @Meta(SchemaType, 'system.object') a: unknown): boolean { return !isEmpty(a); }

  /** a == b */
  @Meta(Return, NS_SYSTEM_BOOL)
  @Meta(Generics, [{ name: 'T' }])
  static eq<T>(
    @Meta(ArgName, 'a') @Meta(SchemaType, 'T') a: T,
    @Meta(ArgName, 'b') @Meta(SchemaType, 'T') b: T,
  ): boolean { return compare(a, b) === 0; }

  /** a != b */
  @Meta(Return, NS_SYSTEM_BOOL)
  @Meta(Generics, [{ name: 'T' }])
  static neq<T>(
    @Meta(ArgName, 'a') @Meta(SchemaType, 'T') a: T,
    @Meta(ArgName, 'b') @Meta(SchemaType, 'T') b: T,
  ): boolean { return compare(a, b) !== 0; }

  /** a >= b */
  @Meta(Return, NS_SYSTEM_BOOL)
  @Meta(Generics, [{ name: 'T' }])
  static ge<T>(
    @Meta(ArgName, 'a') @Meta(SchemaType, 'T') a: T,
    @Meta(ArgName, 'b') @Meta(SchemaType, 'T') b: T,
  ): boolean { return compare(a, b) >= 0; }

  /** a > b */
  @Meta(Return, NS_SYSTEM_BOOL)
  @Meta(Generics, [{ name: 'T' }])
  static gt<T>(
    @Meta(ArgName, 'a') @Meta(SchemaType, 'T') a: T,
    @Meta(ArgName, 'b') @Meta(SchemaType, 'T') b: T,
  ): boolean { return compare(a, b) > 0; }

  /** a <= b */
  @Meta(Return, NS_SYSTEM_BOOL)
  @Meta(Generics, [{ name: 'T' }])
  static le<T>(
    @Meta(ArgName, 'a') @Meta(SchemaType, 'T') a: T,
    @Meta(ArgName, 'b') @Meta(SchemaType, 'T') b: T,
  ): boolean { return compare(a, b) <= 0; }

  /** a < b */
  @Meta(Return, NS_SYSTEM_BOOL)
  @Meta(Generics, [{ name: 'T' }])
  static lt<T>(
    @Meta(ArgName, 'a') @Meta(SchemaType, 'T') a: T,
    @Meta(ArgName, 'b') @Meta(SchemaType, 'T') b: T,
  ): boolean { return compare(a, b) < 0; }
}
