// =============================================================================
// system.intrinsic — C# SystemIntrinsic.cs mirror
// =============================================================================

import { Meta } from '../attribute/meta';
import { ArgName } from '../property/function/argName';
import { OfSchema } from '../property/core/ofSchema';
import { SchemaType } from '../property/core/schemaType';
import { Return } from '../property/function/return';
import { Generics } from  '../schema/generic/property';
import { Require } from '../property/constraint/require';
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_BOOL, NS_SYSTEM_INTRINSIC } from '../utility/constant';
import { deepClone, isEmpty, isNull } from '../utility/toolset';

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_INTRINSIC)
export class SystemIntrinsic {
  /** Assign value */
  @Meta(Return, 'T') 
  @Meta(Generics, [{ name: 'T' }])
  static assign<T>(
    @Meta(ArgName, 'input') @Meta(SchemaType, 'T') input: T
  ): T { return deepClone(input); }

  /** Default value */
  @Meta(Return, 'T') 
  @Meta(Generics, [{ name: 'T' }])
  static default<T>(
    @Meta(ArgName, 'value') @Meta(SchemaType, 'T') v: T, 
    @Meta(ArgName, 'default') @Meta(SchemaType, 'T') @Meta(Require, true) d: T
  ): T { return (isNull(v) ? d : v) as T; }

  /** Return null of the given type */
  @Meta(Return, 'T')
  static null<T>(): T | null { return null; }

  /** if match the condition, return the value and stop the execution*/
  @Meta(Return, 'T') 
  @Meta(Generics, [{ name: 'T' }])
  static ifret<T>(
    @Meta(ArgName, 'cond') @Meta(SchemaType, NS_SYSTEM_BOOL) @Meta(Require, true) cond: boolean, 
    @Meta(ArgName, 'value') @Meta(SchemaType, 'T') value: T
  ): T | null { return cond ? value : null; }

  /** if not match the condition, return the value and stop the execution */
  @Meta(Return, 'T') 
  @Meta(Generics, [{ name: 'T' }])
  static ifnot<T>(
    @Meta(ArgName, 'cond')  @Meta(SchemaType, NS_SYSTEM_BOOL)  @Meta(Require, true)  cond: boolean, 
    @Meta(ArgName, 'value')  @Meta(SchemaType, 'T')  value: T
  ): T | null { return !cond ? value : null; }

  /** if the value is null, return the value and stop the execution */
  @Meta(Return, 'T1') 
  @Meta(Generics, [{ name: 'T1' }, { name: 'T2' }])
  static ifnull<T1, T2>( 
    @Meta(ArgName, 'val')  @Meta(SchemaType, 'T2')  val: T2, 
    @Meta(ArgName, 'value')  @Meta(SchemaType, 'T1')  value: T1
  ): T1 | null { return isNull(val) ? value : null; }

  /** if the value is empty, return the value and stop the execution */
  @Meta(Return, 'T1') 
  @Meta(Generics, [{ name: 'T1' }, { name: 'T2' }])
  static ifempty<T1, T2>( 
    @Meta(ArgName, 'val')  @Meta(SchemaType, 'T2')  val: T2, 
    @Meta(ArgName, 'value')  @Meta(SchemaType, 'T1')  value: T1
  ): T1 | null { return isEmpty(val) ? value : null; }
}
