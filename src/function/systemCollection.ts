import { Meta } from '../attribute/meta';
import { OfSchema, SchemaType, Return, Generics } from '../property/index';
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_BOOL, NS_SYSTEM_INT } from '../utility/constant';

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, 'system.collection')
export class SystemCollection {
  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.collection.len') @Meta(Return, NS_SYSTEM_INT)
  static len(@Meta(SchemaType, 'system.array') array: unknown[]): number { return array.length; }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.collection.contains') @Meta(Return, NS_SYSTEM_BOOL) @Meta(Generics, [{ name: 'T' }])
  static contains<T>(@Meta(SchemaType, 'system.array') array: T[], @Meta(SchemaType, 'T') value: T): boolean { return array.includes(value); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.collection.notcontains') @Meta(Return, NS_SYSTEM_BOOL) @Meta(Generics, [{ name: 'T' }])
  static notcontains<T>(@Meta(SchemaType, 'system.array') array: T[], @Meta(SchemaType, 'T') value: T): boolean { return !array.includes(value); }
}
