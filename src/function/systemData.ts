import { Meta } from "../attribute/meta";
import { OfSchema, SchemaType, Return, ArgName } from "../property";
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_DATA, NS_SYSTEM_BOOL, NS_SYSTEM_STRING, NS_SYSTEM_INT } from "../utility/constant";

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_DATA)
export class SystemData {
  // Context-dependent methods — stubs that require SchemaContext at runtime
}

/** system.data.enum — enum value operations (SchemaContext required at runtime) */
@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, `${NS_SYSTEM_DATA}.enum`)
export class SystemDataEnum {
  @Meta(SchemaType, `${NS_SYSTEM_DATA}.enum.isdescendant`) @Meta(Return, NS_SYSTEM_BOOL)
  static isdescendant(
    @Meta(ArgName, 'enum') @Meta(SchemaType, NS_SYSTEM_STRING) enumType: string,
    @Meta(ArgName, 'value') @Meta(SchemaType, NS_SYSTEM_STRING) value: string,
    @Meta(ArgName, 'root') @Meta(SchemaType, NS_SYSTEM_STRING) root: string,
  ): boolean {
    if (!value.trim() || !root.trim()) return false;
    return value.trim().toLowerCase() === root.trim().toLowerCase();
  }

  @Meta(SchemaType, `${NS_SYSTEM_DATA}.enum.isdescendantany`) @Meta(Return, NS_SYSTEM_BOOL)
  static isdescendantany(
    @Meta(ArgName, 'enum') @Meta(SchemaType, NS_SYSTEM_STRING) enumType: string,
    @Meta(ArgName, 'value') @Meta(SchemaType, NS_SYSTEM_STRING) value: string,
    @Meta(ArgName, 'roots') @Meta(SchemaType, `system.list<${NS_SYSTEM_STRING}>`) roots: string[],
  ): boolean {
    if (!value.trim() || roots.length === 0) return false;
    return roots.some(r => r.trim().toLowerCase() === value.trim().toLowerCase());
  }

  @Meta(SchemaType, `${NS_SYSTEM_DATA}.enum.parent`) @Meta(Return, NS_SYSTEM_STRING)
  static parent(
    @Meta(ArgName, 'enum') @Meta(SchemaType, NS_SYSTEM_STRING) enumType: string,
    @Meta(ArgName, 'value') @Meta(SchemaType, NS_SYSTEM_STRING) value: string,
    @Meta(ArgName, 'depth') @Meta(SchemaType, NS_SYSTEM_INT) depth?: number,
  ): string { return ''; }

  @Meta(SchemaType, `${NS_SYSTEM_DATA}.enum.depth`) @Meta(Return, NS_SYSTEM_INT)
  static depth(
    @Meta(ArgName, 'enum') @Meta(SchemaType, NS_SYSTEM_STRING) enumType: string,
    @Meta(ArgName, 'value') @Meta(SchemaType, NS_SYSTEM_STRING) value: string,
  ): number { return -1; }

  @Meta(SchemaType, `${NS_SYSTEM_DATA}.enum.lca`) @Meta(Return, NS_SYSTEM_STRING)
  static lca(
    @Meta(ArgName, 'enum') @Meta(SchemaType, NS_SYSTEM_STRING) enumType: string,
    @Meta(ArgName, 'values') @Meta(SchemaType, `system.list<${NS_SYSTEM_STRING}>`) values: string[],
  ): string { return ''; }
}
