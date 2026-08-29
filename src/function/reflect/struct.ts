import { Meta } from '../../attribute/meta';
import { ArgName } from '../../property/function/argName';
import { Display } from '../../property/common/display';
import { getPropertyValue, setPropertyValue } from '../../property/propertyOwner';
import { OfSchema } from '../../property/core/ofSchema';
import { Require } from '../../property/constraint/require';
import { Return } from '../../property/function/return';
import { SchemaType } from '../../property/core/schemaType';
import { UpLimitString } from '../../property/constraint/upLimit';
import { combinePaths, isNull } from '../../utility/toolset';
import { _LS } from '../../utility/locale';
import { getNodeType } from '../../runtime/context';
import { ValueType } from '../../schema/value/runtime';
import { StringType } from '../../schema/string/runtime';
import { StructType } from '../../schema/struct/runtime';
import { ArrayType } from '../../schema/array/runtime';
import { ObjectType } from '../../schema/object/runtime';

import type { EntryAccess, Entry } from '../../struct/entry/type';
import type { StructFieldSchema } from '../../schema/struct/type';

import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_SCHEMA_REFLECT_STRUCT, NS_SYSTEM_ENTRY_ACCESS, NS_SYSTEM_LIST, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_STRUCT, PRIMARY_KEY_MAX_LEN, NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_STRUCT_FIELD, NS_SYSTEM_ENTRY } from '../../utility/constant';

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_REFLECT_STRUCT)
export class SystemReflectStruct {
    
  /** Gets the sub entries of the struct fields */
  @Meta(Return, `${NS_SYSTEM_LIST}<${NS_SYSTEM_ENTRY_ACCESS}<${NS_SYSTEM_STRING}>>`)
  static async getaccessentries(
    @Meta(ArgName, 'fields')
    @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRUCT}.fields`)
    @Meta(Require, true)
    fields: StructFieldSchema[],

    @Meta(ArgName, 'path')
    @Meta(SchemaType, NS_SYSTEM_STRING)
    path?: string,

    @Meta(ArgName, 'root')
    @Meta(SchemaType, NS_SYSTEM_STRING)
    root?: string
  ): Promise<EntryAccess<string>[]> {
    if (!fields?.length) return [];
    path = path?.toLowerCase() ?? '';
    root = root?.toLowerCase() ?? '';
    if (path && root && path !== root && !path.startsWith(`${root}.`)) return [];
    if (!root) root = path;

    // first
    const first: Entry<string>[] = [];
    for(let f of fields)
    {
      if (!f.name || !f.type) continue;
      const ftype = await getNodeType(f.type) as ValueType;
      if (!ftype) continue;
      const entry: Entry<string> = { value: f.name, hasChildren: ftype.hasAccessEntries };
      setPropertyValue(entry, Display, getPropertyValue(f, Display) ?? ftype.getProperty(Display)?.getValue() ?? _LS(f.name));
      first.push(entry);
    }

    const result: EntryAccess<string>[] = [ { children: first} ];
    let curr = result[0].children?.find(c => c.value.toLowerCase() === root || root.startsWith(`${c.value.toLowerCase()}.`));
    let valueType = curr ? await getNodeType(fields.find(f => f.name == curr?.value)!.type) as ValueType : undefined;
    while (valueType)
    {
      const accessEntry: EntryAccess<string> = {};
      const accesses = valueType.getAccessEntries();
      if (curr)
      {
        accessEntry.entry = setPropertyValue(
          { value: curr.value, hasChildren: accesses.length > 0 },
          Display,
          getPropertyValue(curr, Display)
        );
      }
      accessEntry.children = accesses;

      // check next part
      let next: ValueType | undefined;
      for (const a of accesses)
      {
        const n = a.value;
        if (curr) a.value = combinePaths(curr.value, n);
        if (path && (path === a.value || path.startsWith(a.value + '.')))
        {
          next = valueType.getAccessValueType(n);
          curr = a;
        }
      }
      result.push(accessEntry);
      valueType = next;
    }

    // cut
    return root ? result.filter(e => (e.entry?.value?.length ?? 0) < root.length) : result;
  }

  /** Gets the value type of the struct field */
  @Meta(Return, NS_SYSTEM_STRING)
  static async getaccessvaluetype(
    @Meta(ArgName, 'fields')
    @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRUCT}.fields`)
    @Meta(Require, true)
    fields: StructFieldSchema[],

    @Meta(ArgName, 'path')
    @Meta(SchemaType, NS_SYSTEM_STRING)
    path: string
  ): Promise<string | undefined> {
    const dotIndex = path.indexOf('.');
    const fieldName = dotIndex === -1 ? path : path.substring(0, dotIndex);
    const field = fields.find(f => f.name === fieldName);
    if (!field || !field.type) return undefined;
    const valueType = await getNodeType(field.type) as ValueType;
    return dotIndex === -1 ? valueType?.name : valueType?.getAccessValueType(path.substring(dotIndex + 1))?.name;
  }

  /** The field is indexable */
  @Meta(Return, NS_SYSTEM_BOOL)
  static async isindexablefield(
    @Meta(ArgName, "field")
    @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRUCT_FIELD}.schema`)
    field: StructFieldSchema)
  {
    const type = !field.type ? undefined : await getNodeType(field.type) as ValueType;
    if (type?.isIndexable) return true;
    if (type instanceof StringType)
    {
      let uplimit = getPropertyValue(field, UpLimitString);
      if (!isNull(uplimit)) uplimit = parseInt(`${uplimit}`);
      if (!isNull(uplimit) && isFinite(uplimit as number))
        return uplimit as number <= PRIMARY_KEY_MAX_LEN;
    }
    return false;
  }

  /** get the struct indexable fields */
  @Meta(Return, `${NS_SYSTEM_LIST}<${NS_SYSTEM_ENTRY}<${NS_SYSTEM_STRING}>>`)
  static async getindexablefields(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
    type: string
  ): Promise<Entry<string>[]> {
    var structType = type ? await getNodeType(type) : undefined;
    if (!(structType instanceof StructType)) return [];
    const result: Entry<string>[] = [];
    for (let f of structType.getFields())
    {
      if (f.type?.isIndexable || f.type instanceof StringType && !isNull(f.getPropertyValue(UpLimitString)) && f.getPropertyValue(UpLimitString) as number <= PRIMARY_KEY_MAX_LEN)
        result.push(setPropertyValue({ value: f.name, hasChildren: false }, Display, f.getPropertyValue(Display) ?? _LS(f.name)));
    }
    return result;
  }

  /// <summary>
  /// Gets the the type has object type, should enable topology
  /// </summary>
  @Meta(Return, NS_SYSTEM_BOOL)
  static async hasdynamicfield(
    @Meta(ArgName, "type")
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
    type: string
  ): Promise<boolean> {
    let valueType = type ? await getNodeType(type) as ValueType : undefined;
    if (valueType instanceof ArrayType) valueType = valueType.element;
    if (valueType instanceof StructType) return valueType.getFields().some(f => f.type instanceof ObjectType);
    return false;
  }
}