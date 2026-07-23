import { Meta } from "../attribute/meta";
import { OfSchema, SchemaType, Return, ArgName } from "../property";
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_DATA, NS_SYSTEM_BOOL, NS_SYSTEM_STRING, NS_SYSTEM_INT, NS_SYSTEM_DATA_ENUM } from "../utility/constant";
import { getNodeType } from "../runtime/schemaRuntime";
import { EnumType } from "../runtime/type/enumType";
import { EntryAccess } from "../struct/entry";

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_DATA)
export class SystemData {
}

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_DATA_ENUM)
export class SystemDataEnum {
  @Meta(SchemaType, `${NS_SYSTEM_DATA_ENUM}.getenumaccess`)
  @Meta(Return, `system.list<${NS_SYSTEM_DATA_ENUM}.entryaccess>`)
  static async getenumaccess(
    @Meta(ArgName, 'enum') @Meta(SchemaType, NS_SYSTEM_STRING) enumTypeStr: string,
    @Meta(ArgName, 'value') @Meta(SchemaType, NS_SYSTEM_STRING) value?: string,
    @Meta(ArgName, 'root') @Meta(SchemaType, NS_SYSTEM_STRING) root?: string,
  ): Promise<EntryAccess<string>[]> {
    const enumType = await getNodeType(enumTypeStr) as EnumType;
    if (!enumType) return [];
    return await enumType.getEnumEntryAccess(value, root);
  }

  @Meta(SchemaType, `${NS_SYSTEM_DATA_ENUM}.isdescendant`) @Meta(Return, NS_SYSTEM_BOOL)
  static async isdescendant(
    @Meta(ArgName, 'enum') @Meta(SchemaType, NS_SYSTEM_STRING) enumTypeStr: string,
    @Meta(ArgName, 'value') @Meta(SchemaType, NS_SYSTEM_STRING) value: string,
    @Meta(ArgName, 'root') @Meta(SchemaType, NS_SYSTEM_STRING) root: string,
  ): Promise<boolean> {
    value = value.trim();
    root = root.trim();
    if (!value || !root) return false;
    if (value.toLowerCase() === root.toLowerCase()) return true;

    const enumType = await getNodeType(enumTypeStr) as EnumType;
    if (!enumType) return false;
    const access = await enumType.getEnumEntryAccess(value, root);
    return access.length > 0;
  }

  @Meta(SchemaType, `${NS_SYSTEM_DATA_ENUM}.isdescendantany`) @Meta(Return, NS_SYSTEM_BOOL)
  static async isdescendantany(
    @Meta(ArgName, 'enum') @Meta(SchemaType, NS_SYSTEM_STRING) enumTypeStr: string,
    @Meta(ArgName, 'value') @Meta(SchemaType, NS_SYSTEM_STRING) value: string,
    @Meta(ArgName, 'roots') @Meta(SchemaType, `system.list<${NS_SYSTEM_STRING}>`) roots: string[],
  ): Promise<boolean> {
    value = value.trim();
    const rootSet = new Set(roots.map(r => r.trim().toLowerCase()));
    if (!value || roots.length === 0) return false;
    if (rootSet.has(value.toLowerCase())) return true;

    const enumType = await getNodeType(enumTypeStr) as EnumType;
    if (!enumType) return false;
    const access = await enumType.getEnumEntryAccess(value);
    return access.some(a => a.entry?.value != null && rootSet.has((a.entry.value as string).toLowerCase()));
  }

  @Meta(SchemaType, `${NS_SYSTEM_DATA_ENUM}.parent`) @Meta(Return, NS_SYSTEM_STRING)
  static async parent(
    @Meta(ArgName, 'enum') @Meta(SchemaType, NS_SYSTEM_STRING) enumTypeStr: string,
    @Meta(ArgName, 'value') @Meta(SchemaType, NS_SYSTEM_STRING) value: string,
    @Meta(ArgName, 'depth') @Meta(SchemaType, NS_SYSTEM_INT) depth?: number,
  ): Promise<string> {
    value = value.trim();
    if (!value) return '';

    const enumType = await getNodeType(enumTypeStr) as EnumType;
    if (!enumType) return '';
    const access = await enumType.getEnumEntryAccess(value);
    const d = depth ?? 0;
    return d < 0
      ? access.length > 1 - d ? (access[access.length + d - 1].entry?.value as string) ?? '' : ''
      : access.length > d ? (access[d].entry?.value as string) ?? '' : '';
  }

  @Meta(SchemaType, `${NS_SYSTEM_DATA_ENUM}.depth`) @Meta(Return, NS_SYSTEM_INT)
  static async depth(
    @Meta(ArgName, 'enum') @Meta(SchemaType, NS_SYSTEM_STRING) enumTypeStr: string,
    @Meta(ArgName, 'value') @Meta(SchemaType, NS_SYSTEM_STRING) value: string,
  ): Promise<number> {
    value = value.trim();
    if (!value) return -1;

    const enumType = await getNodeType(enumTypeStr) as EnumType;
    if (!enumType) return -1;
    const access = await enumType.getEnumEntryAccess(value);
    return access.length - 1;
  }

  @Meta(SchemaType, `${NS_SYSTEM_DATA_ENUM}.lca`) @Meta(Return, NS_SYSTEM_STRING)
  static async lca(
    @Meta(ArgName, 'enum') @Meta(SchemaType, NS_SYSTEM_STRING) enumTypeStr: string,
    @Meta(ArgName, 'values') @Meta(SchemaType, `system.list<${NS_SYSTEM_STRING}>`) values: string[],
  ): Promise<string> {
    values = values.map(v => v.trim()).filter(v => !!v);
    if (values.length === 0) return '';

    const enumType = await getNodeType(enumTypeStr) as EnumType;
    if (!enumType) return '';

    let access = await enumType.getEnumEntryAccess(values[0]);
    for (let i = 1; i < values.length; i++) {
      const next = await enumType.getEnumEntryAccess(values[i]);
      if (next.length === 0) { access = []; break; }
      for (let j = 1; j < access.length && j < next.length; j++) {
        if ((access[j].entry?.value as string)?.toLowerCase() !== (next[j].entry?.value as string)?.toLowerCase()) {
          access = access.slice(0, j);
          break;
        }
      }
      if (access.length > next.length) access = access.slice(0, next.length);
      if (access.length <= 1) break;
    }
    return access.length > 1 ? (access[access.length - 1].entry?.value as string) ?? '' : '';
  }
}
