// =============================================================================
// system.logic — and, or, not, between, cond, isnull, isempty, eq, neq, ge, gt, le, lt
// Mirrors C# SchemaNode.Core/Function/SystemLogic.cs
// =============================================================================

import BigNumber from 'bignumber.js';
import { Meta } from '../attribute/meta';
import { OfSchema, SchemaType, Return, Generics } from '../property/index';
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_BOOL } from '../utility/constant';

// ── Helpers ────────────────────────────────────────────────────────────────

function isNull(v: unknown): boolean { return v === null || v === undefined || v === ""; }
function isEmpty(v: unknown): boolean {
  if (isNull(v)) return true;
  if (typeof v === 'string' && v === '') return true;
  if (Array.isArray(v) && v.length === 0) return true;
  return false;
}

function compare<T>(a: T, b: T): number {
  if (a instanceof BigNumber && b instanceof BigNumber) return a.comparedTo(b) ?? 0;
  if (a === b) return 0;
  return (a as unknown as number) < (b as unknown as number) ? -1 : 1;
}

// ── Class ──────────────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, 'system.logic')
export class SystemLogic {
  @Meta(OfSchema, SCHEMA_KIND_FUNCTION)
  @Meta(SchemaType, 'system.logic.and')
  @Meta(Return, NS_SYSTEM_BOOL)
  static and(@Meta(SchemaType, NS_SYSTEM_BOOL) a: boolean,
             @Meta(SchemaType, NS_SYSTEM_BOOL) b: boolean): boolean { return a && b; }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION)
  @Meta(SchemaType, 'system.logic.or')
  @Meta(Return, NS_SYSTEM_BOOL)
  static or(@Meta(SchemaType, NS_SYSTEM_BOOL) a: boolean,
            @Meta(SchemaType, NS_SYSTEM_BOOL) b: boolean): boolean { return a || b; }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION)
  @Meta(SchemaType, 'system.logic.not')
  @Meta(Return, NS_SYSTEM_BOOL)
  static not(@Meta(SchemaType, NS_SYSTEM_BOOL) a: boolean): boolean { return !a; }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION)
  @Meta(SchemaType, 'system.logic.isnull')
  @Meta(Return, NS_SYSTEM_BOOL)
  @Meta(Generics, [{ name: 'T' }])
  static isnull<T>(@Meta(SchemaType, 'T') a: T): boolean { return isNull(a); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION)
  @Meta(SchemaType, 'system.logic.notnull')
  @Meta(Return, NS_SYSTEM_BOOL)
  @Meta(Generics, [{ name: 'T' }])
  static notnull<T>(@Meta(SchemaType, 'T') a: T): boolean { return !isNull(a); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION)
  @Meta(SchemaType, 'system.logic.isempty')
  @Meta(Return, NS_SYSTEM_BOOL)
  static isempty(@Meta(SchemaType, 'system.object') a: unknown): boolean { return isEmpty(a); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION)
  @Meta(SchemaType, 'system.logic.notempty')
  @Meta(Return, NS_SYSTEM_BOOL)
  static notempty(@Meta(SchemaType, 'system.object') a: unknown): boolean { return !isEmpty(a); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION)
  @Meta(SchemaType, 'system.logic.eq')
  @Meta(Return, NS_SYSTEM_BOOL)
  @Meta(Generics, [{ name: 'T' }])
  static eq<T>(@Meta(SchemaType, 'T') a: T,
               @Meta(SchemaType, 'T') b: T): boolean { return compare(a, b) === 0; }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION)
  @Meta(SchemaType, 'system.logic.neq')
  @Meta(Generics, [{ name: 'T' }])
  static neq<T>(@Meta(SchemaType, 'T') a: T,
                @Meta(SchemaType, 'T') b: T): boolean { return compare(a, b) !== 0; }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION)
  @Meta(SchemaType, 'system.logic.ge')
  @Meta(Generics, [{ name: 'T' }])
  static ge<T>(@Meta(SchemaType, 'T') a: T,
               @Meta(SchemaType, 'T') b: T): boolean { return compare(a, b) >= 0; }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION)
  @Meta(SchemaType, 'system.logic.gt')
  @Meta(Generics, [{ name: 'T' }])
  static gt<T>(@Meta(SchemaType, 'T') a: T,
               @Meta(SchemaType, 'T') b: T): boolean { return compare(a, b) > 0; }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION)
  @Meta(SchemaType, 'system.logic.le')
  @Meta(Generics, [{ name: 'T' }])
  static le<T>(@Meta(SchemaType, 'T') a: T,
               @Meta(SchemaType, 'T') b: T): boolean { return compare(a, b) <= 0; }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION)
  @Meta(SchemaType, 'system.logic.lt')
  @Meta(Generics, [{ name: 'T' }])
  static lt<T>(@Meta(SchemaType, 'T') a: T,
               @Meta(SchemaType, 'T') b: T): boolean { return compare(a, b) < 0; }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION)
  @Meta(SchemaType, 'system.logic.between')
  @Meta(Return, NS_SYSTEM_BOOL)
  @Meta(Generics, [{ name: 'T' }])
  static between<T>(@Meta(SchemaType, 'T') v: T,
                    @Meta(SchemaType, 'T') min: T,
                    @Meta(SchemaType, 'T') max: T): boolean { return compare(v, min) >= 0 && compare(v, max) <= 0; }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION)
  @Meta(SchemaType, 'system.logic.cond')
  @Meta(Return, 'T')
  @Meta(Generics, [{ name: 'T' }])
  static cond<T>(@Meta(SchemaType, NS_SYSTEM_BOOL) cond: boolean,
                 @Meta(SchemaType, 'T') trueValue: T,
                 @Meta(SchemaType, 'T') falseValue: T): T { return cond ? trueValue : falseValue; }
}
