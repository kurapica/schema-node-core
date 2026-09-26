// =============================================================================
// system.collection — array/collection operations
// Mirrors C# SchemaNode.Core/Function/SystemCollection.cs
// Also includes system.data (C# SystemData.cs) per user instructions.
// =============================================================================

import { Meta } from '../attribute/meta';
import { OfSchema } from '../property/core/ofSchema';
import { SchemaType } from '../property/core/schemaType';
import { Return } from '../schema/function/property/return';
import { ArgName } from '../schema/function/property/argName';
import { Variadic } from '../schema/function/property/variadic';
import { Generics } from '../schema/generic/generics';
import { Require } from '../property/common/require';
import { compare, isNull } from '../utility/toolset';
import { Relation } from '../attribute/relation';
import { EntrySource } from '../property/core/entrySource';
import { Assign } from '../relation/assign/meta';
import { buildFuncCall } from '../schema/function/type';

import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_BOOL, NS_SYSTEM_INT, NS_SYSTEM_STRING, NS_SYSTEM_ARRAY, NS_SYSTEM_COLLECTION, NS_SYSTEM_OBJECT, NS_SYSTEM_LIST, NS_SYSTEM_SCHEMA_REFLECT_TYPE, NODE_SELF, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, FUNC_RETURN } from '../utility/constant';
import { AccessEntryConsumer } from '../schema';
import { AccessValueTypeProvider } from '../property';

// ── SystemCollection ───────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_COLLECTION)
export class SystemCollection {

  /** Creates a new array */
  @Meta(Return, `${NS_SYSTEM_LIST}<T>`)
  @Meta(Generics, [{ name: 'T' }])
  static newarray<T>(
    @Meta(ArgName, 'items') 
    @Meta(SchemaType, 'T') 
    @Meta(Variadic, true)
    ...items: T[]
  ) : T[] { return items; }

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
  @Relation(EntrySource, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.getaccessentries`, '@obj.sourceType', NODE_SELF), 'field.value')
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
  @Relation(EntrySource, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getelementaccessentries`, '@array.sourceType', NODE_SELF), 'field.value')
  @Relation(AccessValueTypeProvider, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getelementaccessvaluetype`, '@array.sourceType', NODE_SELF), 'field.value')
  @Relation(AccessEntryConsumer, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.isassignabletoelement`, NODE_SELF, `@${FUNC_RETURN}`), 'field.value')
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

  @Meta(Return, NS_SYSTEM_BOOL)
  @Meta(Generics, [{ name: 'T' }])
  @Relation(EntrySource, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getelementaccessentries`, '@obj.sourceType', NODE_SELF), 'field.value')
  @Relation(AccessValueTypeProvider, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getelementaccessvaluetype`, '@obj.sourceType', NODE_SELF), 'field.value')
  @Relation(AccessEntryConsumer, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.isassignableto`, NODE_SELF, false, '@value.type'), 'field.value')
  static fieldeq<T>(
    @Meta(ArgName, 'obj') 
    @Meta(SchemaType, NS_SYSTEM_OBJECT) 
    @Meta(Require, true)
    obj: Record<string, unknown>,

    @Meta(ArgName, 'field') 
    @Meta(SchemaType, NS_SYSTEM_STRING) 
    @Meta(Require, true)
    field: string,

    @Meta(ArgName, 'value') 
    @Meta(SchemaType, 'T') 
    value: T,
  ): boolean {
    const fieldNode = obj[field];
    return isNull(fieldNode) ? false : compare(fieldNode, value) === 0;
  }
  
  /** a != b */
  @Meta(Return, NS_SYSTEM_BOOL)
  @Meta(Generics, [{ name: 'T' }])
  @Relation(EntrySource, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getelementaccessentries`, '@obj.sourceType', NODE_SELF), 'field.value')
  @Relation(AccessValueTypeProvider, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getelementaccessvaluetype`, '@obj.sourceType', NODE_SELF), 'field.value')
  @Relation(AccessEntryConsumer, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.isassignableto`, NODE_SELF, false, '@value.type'), 'field.value')
  static fieldneq<T>(
    @Meta(ArgName, 'obj') 
    @Meta(SchemaType, NS_SYSTEM_OBJECT) 
    @Meta(Require, true)
    obj: Record<string, unknown>,

    @Meta(ArgName, 'field') 
    @Meta(SchemaType, NS_SYSTEM_STRING) 
    @Meta(Require, true)
    field: string,

    @Meta(ArgName, 'value') 
    @Meta(SchemaType, 'T') 
    value: T,
  ): boolean {
    const fieldNode = obj[field];
    return isNull(fieldNode) ? false : compare(fieldNode, value) !== 0; }

  /** a >= b */
  @Meta(Return, NS_SYSTEM_BOOL)
  @Meta(Generics, [{ name: 'T' }])
  @Relation(EntrySource, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getelementaccessentries`, '@obj.sourceType', NODE_SELF), 'field.value')
  @Relation(AccessValueTypeProvider, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getelementaccessvaluetype`, '@obj.sourceType', NODE_SELF), 'field.value')
  @Relation(AccessEntryConsumer, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.isassignableto`, NODE_SELF, false, '@value.type'), 'field.value')
  static fieldge<T>(
    @Meta(ArgName, 'obj') 
    @Meta(SchemaType, NS_SYSTEM_OBJECT) 
    @Meta(Require, true)
    obj: Record<string, unknown>,

    @Meta(ArgName, 'field') 
    @Meta(SchemaType, NS_SYSTEM_STRING) 
    @Meta(Require, true)
    field: string,

    @Meta(ArgName, 'value') 
    @Meta(SchemaType, 'T') 
    value: T,
  ): boolean {
    const fieldNode = obj[field];
    return isNull(fieldNode) ? false : compare(fieldNode, value) >= 0; }

  /** a > b */
  @Meta(Return, NS_SYSTEM_BOOL)
  @Meta(Generics, [{ name: 'T' }])
  @Relation(EntrySource, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getelementaccessentries`, '@obj.sourceType', NODE_SELF), 'field.value')
  @Relation(AccessValueTypeProvider, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getelementaccessvaluetype`, '@obj.sourceType', NODE_SELF), 'field.value')
  @Relation(AccessEntryConsumer, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.isassignableto`, NODE_SELF, false, '@value.type'), 'field.value')
  static fieldgt<T>(
    @Meta(ArgName, 'obj') 
    @Meta(SchemaType, NS_SYSTEM_OBJECT) 
    @Meta(Require, true)
    obj: Record<string, unknown>,

    @Meta(ArgName, 'field') 
    @Meta(SchemaType, NS_SYSTEM_STRING) 
    @Meta(Require, true)
    field: string,

    @Meta(ArgName, 'value') 
    @Meta(SchemaType, 'T') 
    value: T,
  ): boolean {
    const fieldNode = obj[field];
    return isNull(fieldNode) ? false : compare(fieldNode, value) > 0; }

  /** a <= b */
  @Meta(Return, NS_SYSTEM_BOOL)
  @Meta(Generics, [{ name: 'T' }])
  @Relation(EntrySource, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getelementaccessentries`, '@obj.sourceType', NODE_SELF), 'field.value')
  @Relation(AccessValueTypeProvider, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getelementaccessvaluetype`, '@obj.sourceType', NODE_SELF), 'field.value')
  @Relation(AccessEntryConsumer, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.isassignableto`, NODE_SELF, false, '@value.type'), 'field.value')
  static fieldle<T>(
    @Meta(ArgName, 'obj') 
    @Meta(SchemaType, NS_SYSTEM_OBJECT) 
    @Meta(Require, true)
    obj: Record<string, unknown>,

    @Meta(ArgName, 'field') 
    @Meta(SchemaType, NS_SYSTEM_STRING) 
    @Meta(Require, true)
    field: string,

    @Meta(ArgName, 'value') 
    @Meta(SchemaType, 'T') 
    value: T,
  ): boolean {
    const fieldNode = obj[field];
    return isNull(fieldNode) ? false : compare(fieldNode, value) <= 0; }

  /** a < b */
  @Meta(Return, NS_SYSTEM_BOOL)
  @Meta(Generics, [{ name: 'T' }])
  @Relation(EntrySource, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getelementaccessentries`, '@obj.sourceType', NODE_SELF), 'field.value')
  @Relation(AccessValueTypeProvider, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getelementaccessvaluetype`, '@obj.sourceType', NODE_SELF), 'field.value')
  @Relation(AccessEntryConsumer, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.isassignableto`, NODE_SELF, false, '@value.type'), 'field.value')
  static fieldlt<T>(
    @Meta(ArgName, 'obj') 
    @Meta(SchemaType, NS_SYSTEM_OBJECT) 
    @Meta(Require, true)
    obj: Record<string, unknown>,

    @Meta(ArgName, 'field') 
    @Meta(SchemaType, NS_SYSTEM_STRING) 
    @Meta(Require, true)
    field: string,

    @Meta(ArgName, 'value') 
    @Meta(SchemaType, 'T') 
    value: T,
  ): boolean {
    const fieldNode = obj[field];
    return isNull(fieldNode) ? false : compare(fieldNode, value) < 0;
  }
}