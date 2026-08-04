import { Meta } from "../../attribute";
import { ArgName, Display, getPropertyValue, OfSchema, Require, Return, SchemaType, setPropertyValue } from "../../property";
import { getNodeType, ValueType } from "../../runtime";
import { StructFieldSchema } from "../../schema";
import { EntryAccess, Entry } from "../../struct";
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_SCHEMA_REFLECT_STRUCT, combinePaths, NS_SYSTEM_ENTRY_ACCESS, NS_SYSTEM_LIST, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_STRUCT, _LS } from "../../utility";

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_REFLECT_STRUCT)
export class SystemReflectStruct {
    
  /** Gets the sub entries of the struct fields */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_STRUCT}.getaccessentries`)
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
}