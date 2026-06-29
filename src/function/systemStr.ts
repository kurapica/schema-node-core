import { Meta } from '../attribute/meta';
import { OfSchema, SchemaType, Return } from '../property/index';
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_BOOL, NS_SYSTEM_INT, NS_SYSTEM_STRING } from '../utility/constant';

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, 'system.str')
export class SystemStr {
  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.str.logic.startswith') @Meta(Return, NS_SYSTEM_BOOL)
  static startswith(@Meta(SchemaType, NS_SYSTEM_STRING) s: string, @Meta(SchemaType, NS_SYSTEM_STRING) prefix: string): boolean { return s.startsWith(prefix); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.str.logic.endswith') @Meta(Return, NS_SYSTEM_BOOL)
  static endswith(@Meta(SchemaType, NS_SYSTEM_STRING) s: string, @Meta(SchemaType, NS_SYSTEM_STRING) suffix: string): boolean { return s.endsWith(suffix); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.str.logic.contains') @Meta(Return, NS_SYSTEM_BOOL)
  static contains(@Meta(SchemaType, NS_SYSTEM_STRING) s: string, @Meta(SchemaType, NS_SYSTEM_STRING) sub: string): boolean { return s.includes(sub); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.str.state.len') @Meta(Return, NS_SYSTEM_INT)
  static len(@Meta(SchemaType, NS_SYSTEM_STRING) s: string): number { return s.length; }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.str.convert.concat') @Meta(Return, NS_SYSTEM_STRING)
  static concat(@Meta(SchemaType, NS_SYSTEM_STRING) a: string, @Meta(SchemaType, NS_SYSTEM_STRING) b: string): string { return a + b; }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.str.convert.trim') @Meta(Return, NS_SYSTEM_STRING)
  static trim(@Meta(SchemaType, NS_SYSTEM_STRING) s: string): string { return s.trim(); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.str.convert.tolower') @Meta(Return, NS_SYSTEM_STRING)
  static tolower(@Meta(SchemaType, NS_SYSTEM_STRING) s: string): string { return s.toLowerCase(); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.str.convert.toupper') @Meta(Return, NS_SYSTEM_STRING)
  static toupper(@Meta(SchemaType, NS_SYSTEM_STRING) s: string): string { return s.toUpperCase(); }
}
