// =============================================================================
// system.collection — array/collection operations
// Mirrors C# SchemaNode.Core/Function/SystemCollection.cs
// Also includes system.data (C# SystemData.cs) per user instructions.
// =============================================================================

import { Meta } from '../attribute/meta';
import { OfSchema, SchemaType, Return, Generics, ArgName, Require } from '../property/index';
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_BOOL, NS_SYSTEM_INT, NS_SYSTEM_STRING, NS_SYSTEM_ARRAY, NS_SYSTEM_COLLECTION, NS_SYSTEM_OBJECT } from '../utility/constant';
import { isNull } from '../utility/toolset';

// ── SystemCollection ───────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_COLLECTION)
export class SystemCollection {
  /**  Gets the array length */
  @Meta(SchemaType, `${NS_SYSTEM_COLLECTION}.length`) 
  @Meta(Return, NS_SYSTEM_INT)
  static len(
    @Meta(ArgName, 'array') 
    @Meta(SchemaType, NS_SYSTEM_ARRAY) 
    @Meta(Require, true)
    array: unknown[] | string
  ): number {
    if (typeof array === 'string') return array.length;
    if (Array.isArray(array)) return array.length;
    return 0;
  }

  /** Whether the list contains the item */
  @Meta(Return, NS_SYSTEM_BOOL) 
  @Meta(Generics, [{ name: 'T' }])
  static contains<T>(
    @Meta(ArgName, 'array') 
    @Meta(SchemaType, NS_SYSTEM_ARRAY) 
    @Meta(Require, true)
    array: T[],

    @Meta(ArgName, 'value') 
    @Meta(SchemaType, 'T') 
    @Meta(Require, true)
    value: T,
  ): boolean { return array.includes(value); }

  /** Whether the list not contains the item */
  @Meta(Return, NS_SYSTEM_BOOL) 
  @Meta(Generics, [{ name: 'T' }])
  static notcontains<T>(
    @Meta(ArgName, 'array') 
    @Meta(SchemaType, NS_SYSTEM_ARRAY) 
    @Meta(Require, true)
    array: T[],

    @Meta(ArgName, 'value') 
    @Meta(SchemaType, 'T') 
    @Meta(Require, true)
    value: T,
  ): boolean { return !array.includes(value); }

  /** Gets the field value from the object */
  @Meta(Return, 'T')
  @Meta(Generics, [{ name: 'T' }])
  static getfield<T>(
    @Meta(ArgName, 'obj') 
    @Meta(SchemaType, NS_SYSTEM_OBJECT) 
    @Meta(Require, true)
    obj: Record<string, unknown>,

    @Meta(ArgName, 'field') 
    @Meta(SchemaType, NS_SYSTEM_STRING) 
    @Meta(Require, true)
    field: string,

    @Meta(ArgName, 'default')
    @Meta(SchemaType, 'T') 
    defaultValue: T = undefined as unknown as T,
  ): T | undefined {
    if (!obj) return defaultValue;
    const fieldNode = obj[field];
    return isNull(fieldNode) ? defaultValue : fieldNode as T;
  }

  /** Gets fields from the objects in the array to a new array */
  @Meta(Return, NS_SYSTEM_ARRAY)
  @Meta(Generics, [{ name: 'T' }])
  static getfields<T>(
    @Meta(ArgName, 'array') 
    @Meta(SchemaType, NS_SYSTEM_ARRAY) 
    @Meta(Require, true)
    array: Record<string, unknown>[],

    @Meta(ArgName, 'field') 
    @Meta(SchemaType, NS_SYSTEM_STRING) 
    @Meta(Require, true)
    field: string
  ): T[] {
    return array.map((obj) => obj[field]).filter((v): v is T => !isNull(v));
  }

  /** Orders the array by the specified field */
  @Meta(Return, NS_SYSTEM_ARRAY)
  @Meta(Generics, [{ name: 'T' }])
  static orderby(
    @Meta(ArgName, 'array')
    @Meta(SchemaType, NS_SYSTEM_ARRAY) 
    @Meta(Require, true)
    array: Record<string, unknown>[],

    @Meta(ArgName, 'field') 
    @Meta(SchemaType, NS_SYSTEM_STRING)
    @Meta(Require, true)
    field: string,

    @Meta(ArgName, 'descending')
    @Meta(SchemaType, NS_SYSTEM_BOOL)
    descending: boolean = false
  ): Record<string, unknown>[] {
    const value = [...array];
    value.sort((a, b) => {
      const valueA: any = a[field];
      const valueB: any = b[field];
      if (isNull(valueA) && isNull(valueB)) return 0;
      if (isNull(valueA)) return (descending ? -1 : 1);
      if (isNull(valueB)) return (descending ? 1 : -1);
      return (valueA < valueB ? -1 : valueA > valueB ? 1 : 0) * (descending ? -1 : 1);
    });
    return value;
  }

  /** Skips the first n elements of the array */
  @Meta(Return, NS_SYSTEM_ARRAY)
  static skip<T>(
    @Meta(ArgName, 'array')
     @Meta(SchemaType, NS_SYSTEM_ARRAY) 
     @Meta(Require, true)
     array: T[],

    @Meta(ArgName, 'count') 
    @Meta(SchemaType, NS_SYSTEM_INT) 
    @Meta(Require, true)
    count: number,
  ): T[] { return count <= 0 ? [...array] : array.slice(count); }

  /** Takes the first n elements of the array */
  @Meta(Return, NS_SYSTEM_ARRAY)
  static take<T>(
    @Meta(ArgName, 'array') 
    @Meta(SchemaType, NS_SYSTEM_ARRAY) 
    @Meta(Require, true)
    array: T[],

    @Meta(ArgName, 'count') 
    @Meta(SchemaType, NS_SYSTEM_INT) 
    @Meta(Require, true)
    count: number,
  ): T[] { return count >= array.length ? [...array] : array.slice(0, count); }
}