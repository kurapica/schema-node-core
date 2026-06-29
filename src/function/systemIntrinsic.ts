// =============================================================================
// system.intrinsic — C# SystemIntrinsic.cs mirror
// =============================================================================

import { Meta } from '../attribute/meta';
import { OfSchema, SchemaType, Return, Generics } from '../property/index';
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_BOOL } from '../utility/constant';

function isNull(v: unknown): boolean { return v === null || v === undefined; }
function isEmpty(v: unknown): boolean { if (isNull(v)) return true; if (typeof v === 'string' && v === '') return true; if (Array.isArray(v) && v.length === 0) return true; return false; }
function deepClone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, 'system.intrinsic')
export class SystemIntrinsic {
  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.intrinsic.assign') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T' }])
  static assign<T>(@Meta(SchemaType, 'T') input: T): T { return deepClone(input); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.intrinsic.default') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T' }])
  static defaultValue<T>(@Meta(SchemaType, 'T') a: T, @Meta(SchemaType, 'T') d: T): T { return (isNull(a) ? d : a) as T; }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.intrinsic.null') @Meta(Return, 'T')
  static nullValue<T>(): T | null { return null; }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.intrinsic.ifret') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T' }])
  static ifret<T>(@Meta(SchemaType, NS_SYSTEM_BOOL) cond: boolean, @Meta(SchemaType, 'T') value: T): T | null { return cond ? value : null; }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.intrinsic.ifnot') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T' }])
  static ifnot<T>(@Meta(SchemaType, NS_SYSTEM_BOOL) cond: boolean, @Meta(SchemaType, 'T') value: T): T | null { return !cond ? value : null; }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.intrinsic.ifnull') @Meta(Return, 'T1') @Meta(Generics, [{ name: 'T1' }, { name: 'T2' }])
  static ifnull<T1, T2>(@Meta(SchemaType, 'T2') val: T2, @Meta(SchemaType, 'T1') value: T1): T1 | null { return isNull(val) ? value : null; }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.intrinsic.ifempty') @Meta(Return, 'T1') @Meta(Generics, [{ name: 'T1' }, { name: 'T2' }])
  static ifempty<T1, T2>(@Meta(SchemaType, 'T2') val: T2, @Meta(SchemaType, 'T1') value: T1): T1 | null { return isEmpty(val) ? value : null; }
}
