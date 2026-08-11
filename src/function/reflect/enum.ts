import { Meta } from '../../attribute/meta';
import { EnumValueType } from '../../enum/enumValueType';
import { OfSchema } from '../../property/core/ofSchema';
import { SchemaType } from '../../property/core/schemaType';
import { Return } from '../../property/function/return';
import { ArgName } from '../../property/function/argName';
import { Require } from '../../property/constraint/require';
import { setPropertyValue } from '../../property/propertyOwner';
import { Display } from '../../property/common/display';
import { EntrySource } from '../../property/core/entrySource';
import { EnumType } from '../../runtime/type/enumType';
import { Entry, EntryAccess } from '../../struct/entry';
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_SCHEMA_REFLECT_ENUM, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_ENUM, NS_SYSTEM_ENTRYS, NS_SYSTEM_INT, NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_NODE_TYPE } from '../../utility/constant';
import { getNodeType } from '../../runtime/schemaRuntime';

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_REFLECT_ENUM)
export class SystemReflectEnum {
  /** Gets the entry type for the given enum value type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.getvaluetype`)
  @Meta(Return, NS_SYSTEM_STRING)
  static getvaluetype(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.valuetype`)
    @Meta(Require, true)
    type: EnumValueType,
  ):string {
    switch (type) {
      case EnumValueType.Int:
      case EnumValueType.Flags:
        return `${NS_SYSTEM_ENTRYS}<${NS_SYSTEM_INT}>`;
      default:
        return `${NS_SYSTEM_ENTRYS}<${NS_SYSTEM_STRING}>`;
    }
  }

  /** Checks if the enum type has the given value type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.isenumvaluetype`)
  @Meta(Return, NS_SYSTEM_BOOL)
  static async isenumvaluetype(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.type`)
    @Meta(Require, true)
    type: string,

    @Meta(ArgName, 'valuetype')
    @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.valuetype`)
    @Meta(Require, true)
    valuetype: EnumValueType,
  ): Promise<boolean> {
    const enumType = await getNodeType(type) as EnumType | undefined;
    return enumType?.type == valuetype;
  }

  /** Gets the default entry value for the given enum value type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.getdefaultentryvalue`)
  @Meta(Return, NS_SYSTEM_STRING)
  static getdefaultentryvalue(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.valuetype`)
    @Meta(Require, true)
    type: EnumValueType,

    @Meta(ArgName, 'values')
    @Meta(SchemaType, `${NS_SYSTEM_ENTRYS}<${NS_SYSTEM_STRING}>`)
    values: Entry<string>[],
   ):string {
    if (type !== EnumValueType.Flags) return '';
    if (values.length === 0) return '0';
    const lastValue = parseInt(values[values.length - 1].value);
    if (isNaN(lastValue)) return '';
    let i = 1;
    while (i <= lastValue) {
      i <<= 1;
    }
    return i.toString();
  }

  /** Checks if the enum type has cascade */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.hascascade`)
  @Meta(Return, NS_SYSTEM_BOOL)
  static async hascascade(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    @Meta(Require, true)
    type: string,

    @Meta(ArgName, 'onlyEnum')
    @Meta(SchemaType, NS_SYSTEM_BOOL)
    @Meta(Require, false)
    onlyEnum: boolean = false
  ): Promise<boolean> {
    const nodeType = await getNodeType(type);
    if (onlyEnum) return nodeType instanceof EnumType && !!nodeType.cascade?.length;
    return nodeType instanceof EnumType ? !!nodeType.cascade?.length : (nodeType?.getProperty(EntrySource)?.hasValue ?? false);
  }

  /** Gets the cascades for the given enum type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.getcascades`)
  @Meta(Return, `${NS_SYSTEM_ENTRYS}<${NS_SYSTEM_INT}>`)
  static async getcascades(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.type`)
    @Meta(Require, true)
    type: string,
  ): Promise<Entry<number>[]> {
    const enumType = await getNodeType(type) as EnumType | undefined;
    return enumType?.cascade?.map((c, i) =>
    {
      return setPropertyValue({
        value: i + 1,
        hasChildren: false
      }, Display, c);
    }) ?? [];
  }

  /** Gets the entry access for the given enum value type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.getenumaccess`)
  @Meta(Return, `system.list<${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.entryaccess>`)
  static async getenumaccess(
    @Meta(ArgName, 'enum') @Meta(SchemaType, NS_SYSTEM_STRING) enumTypeStr: string,
    @Meta(ArgName, 'value') @Meta(SchemaType, NS_SYSTEM_STRING) value?: string,
    @Meta(ArgName, 'root') @Meta(SchemaType, NS_SYSTEM_STRING) root?: string,
  ): Promise<EntryAccess<string>[]> {
    const enumType = await getNodeType(enumTypeStr) as EnumType;
    if (!enumType) return [];
    return await enumType.getEnumEntryAccess(value, root);
  }

  /** Checks if the given value is a descendant of the given root */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.isdescendant`) @Meta(Return, NS_SYSTEM_BOOL)
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

  /** Checks if the given value is a descendant of any of the given roots */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.isdescendantany`) @Meta(Return, NS_SYSTEM_BOOL)
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

  /** Gets the parent of the given enum value */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.parent`) @Meta(Return, NS_SYSTEM_STRING)
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

  /** Gets the depth of the given enum value */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.depth`) @Meta(Return, NS_SYSTEM_INT)
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

  /** Gets the lowest common ancestor of the given enum values */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.lca`) @Meta(Return, NS_SYSTEM_STRING)
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
