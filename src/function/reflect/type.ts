import { Meta } from "../../attribute";
import { OfSchema, SchemaType, Return, ArgName, setPropertyValue, Display, getPropertyValue, Require, Variadic, getRecordedValues, ValueSchemaKind } from "../../property";
import { getNodeType, NamespaceType, PropertyType, ValueType, ArrayType } from "../../runtime";
import { EntryAccess, LocaleString, Entry } from "../../struct";
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_SCHEMA_REFLECT_TYPE, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_NODE_TYPE, NS_SYSTEM_LIST, NS_SYSTEM_ENTRY_ACCESS, SCHEMA_KIND_NAMESPACE, combinePaths, NS_SYSTEM_SCHEMA_PROPERTY_TYPE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_KIND, SCHEMA_KIND_ARRAY, NS_SYSTEM_SCHEMA_DESIGN } from "../../utility";

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_REFLECT_TYPE)
export class SystemReflectType {

  /** Gets the type name of the node schema type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.gettypename`)
  @Meta(Return, NS_SYSTEM_STRING)
  static gettypename(
    @Meta(ArgName, 'name')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    name: string,
  ): string {
    return name.split('<')[0].split('.').pop() || '';
  }

  /** Gets the full names and labels of the schema nodes under the namespace with the given name */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.gettypeentries`)
  @Meta(Return, `${NS_SYSTEM_LIST}<${NS_SYSTEM_ENTRY_ACCESS}<${NS_SYSTEM_STRING}>>`)
  static async gettypeentries(
    @Meta(ArgName, 'name')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    name?: string,

    @Meta(ArgName, 'root')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    root?: string
  ): Promise<EntryAccess<string>[]> {
    name = name?.toLowerCase() ?? '';
    root = root?.toLowerCase() ?? '';
    if (!name && !root || name !== root && !name.startsWith(`${root}.`))
      return [];

    let ns = await getNodeType(name ?? root);
    if (!ns) return [];

    let result: EntryAccess<string>[] = [];
    while (ns != null)
    {
      let access: EntryAccess<string> = {};
      if (ns.namespace != null)
      {
        access.entry = setPropertyValue(
          { value: ns.name, hasChildren: ns.kind === SCHEMA_KIND_NAMESPACE },
          Display,
          ns.getProperty(Display)?.getValue<LocaleString>()
        );
      }
      if (ns instanceof NamespaceType)
      {
        access.children = Array.from(ns.getSubNodeSchemas().map(s => {
          return setPropertyValue(
            { value: combinePaths(ns!.name, s.name), hasChildren: s.kind === SCHEMA_KIND_NAMESPACE },
            Display,
            getPropertyValue(s, Display)
          );
        }));
      }
      result.push(access);
      ns = ns.namespace;
      if (root && ns?.name === root) break;
    }
    result.reverse();
    return result;
  }

  /** Gets the sub entries of the value type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.getaccessentries`)
  @Meta(Return, `${NS_SYSTEM_LIST}<${NS_SYSTEM_ENTRY_ACCESS}<${NS_SYSTEM_STRING}>>`)
  static async getaccessentries(
    @Meta(ArgName, 'name')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
    @Meta(Require, true)
    name: string,

    @Meta(ArgName, 'path')
    @Meta(SchemaType, NS_SYSTEM_STRING)
    path?: string,

    @Meta(ArgName, 'root')
    @Meta(SchemaType, NS_SYSTEM_STRING)
    root?: string
  ): Promise<EntryAccess<string>[]> {
    let valueType = !name ? undefined : await getNodeType(name) as ValueType | undefined;
    if (!valueType) return [];
    path = path?.toLowerCase() ?? '';
    root = root?.toLowerCase() ?? '';
    if (path && root && path !== root && !path.startsWith(`${root}.`))
      return [];
    const result: EntryAccess<string>[] = [];
    let curr: Entry<string> | undefined;
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

  /** Gets the access type of the value type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.getaccesstype`)
  @Meta(Return, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  static async getaccesstype(
    @Meta(ArgName, 'name')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
    @Meta(Require, true)
    name: string,

    @Meta(ArgName, 'access')
    @Meta(SchemaType, NS_SYSTEM_STRING)
    @Meta(Require, true)
    access: string,
  ): Promise<string> {
    let valueType = !name ? undefined : await getNodeType(name) as ValueType | undefined;
    if (!valueType) return "";
    return valueType.getAccessValueType(access)?.name ?? "";
  }

  /** Checks if the schema kind of the schema node with the given name is the same as the given kind */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.isschemakind`)
  @Meta(Return, NS_SYSTEM_BOOL)
  static async isschemakind(
    @Meta(ArgName, 'name')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    @Meta(Require, true)
    name: string,

    @Meta(ArgName, 'matchArrayElement')
    @Meta(SchemaType, NS_SYSTEM_BOOL)
    matchArrayElement: boolean,

    @Meta(ArgName, 'kind')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_KIND)
    @Meta(Require, true)
    @Meta(Variadic, true)
    kinds: string[],
  ): Promise<boolean> {
    const nodeType = !name ? undefined : await getNodeType(name);
    if (!nodeType) return false;
    return kinds.some(kind => {
      if (nodeType.kind.toLowerCase() === kind.toLowerCase()) return true;
      return matchArrayElement && nodeType instanceof ArrayType && nodeType.element?.kind.toLowerCase() === kind.toLowerCase();
    });
  }

  /** hecks if value type of the give access from the type match the given schema kinds */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.isschemakind`)
  @Meta(Return, NS_SYSTEM_BOOL)
  static async isschemakindaccess(
    @Meta(ArgName, 'name')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    @Meta(Require, true)
    name: string,

    @Meta(ArgName, 'access')
    @Meta(SchemaType, NS_SYSTEM_STRING)
    @Meta(Require, true)
    access: string,

    @Meta(ArgName, 'matchArrayElement')
    @Meta(SchemaType, NS_SYSTEM_BOOL)
    matchArrayElement: boolean,

    @Meta(ArgName, 'kind')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_KIND)
    @Meta(Require, true)
    @Meta(Variadic, true)
    kinds: string[],
  ): Promise<boolean> {
    let nodeType = !name ? undefined : await getNodeType(name) as ValueType;
    nodeType = nodeType?.getAccessValueType(access);
    if (!nodeType) return false;
    return kinds.some(kind => {
      if (nodeType.kind.toLowerCase() === kind.toLowerCase()) return true;
      return matchArrayElement && nodeType instanceof ArrayType && nodeType.element?.kind.toLowerCase() === kind.toLowerCase();
    });
  }

  /** Gets the schema kind of the schema node with the given name */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.getschemakind`)
  @Meta(Return, NS_SYSTEM_SCHEMA_KIND)
  static async getschemakind(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    @Meta(Require, true)
    type: string,
  ): Promise<string | undefined> {
    const nodeType = !type ? undefined : await getNodeType(type);
    if (!nodeType) return undefined;
    return nodeType.kind;
  }

  /** Checks if the schema kind of the schema node with the given name is a value schema kind */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.isvaluekind`)
  @Meta(Return, NS_SYSTEM_BOOL)
  static async isvaluekind(
    @Meta(ArgName, 'name')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    @Meta(Require, true)
    name: string,
  ): Promise<boolean> {
    const nodeType = !name ? undefined : await getNodeType(name);
    if (!nodeType) return false;
    const valueKinds = getRecordedValues(ValueSchemaKind);
    return valueKinds.some(v => v.getValue<string>()?.toLowerCase() === nodeType.kind.toLowerCase());
  }

  /** Checks if the schema node with the given name is assignable to the schema node with the given target name */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.isassignableto`)
  @Meta(Return, NS_SYSTEM_BOOL)
  static async isassignableto(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    type: string,

    @Meta(ArgName, 'target')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    target: string,
  ): Promise<boolean> {
    const nodeType = !type ? undefined : await getNodeType(type) as ValueType;
    if (!nodeType) return false;
    const targetNodeType = !target ? undefined : await getNodeType(target) as ValueType;
    if (!targetNodeType) return false;
    return nodeType.isAssignableTo(targetNodeType);
  }

  /** The value type is indexable */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.isindexable`)
  @Meta(Return, NS_SYSTEM_BOOL)
  static async isindexable(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    type: string
  ): Promise<boolean> {
    const nodeType = !type ? undefined : await getNodeType(type) as ValueType;
    return nodeType?.isIndexable ?? false;
  }

  /** Gets the design schema name of the given schema kind */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.getdesignschema`)
  @Meta(Return, NS_SYSTEM_STRING)
  static async getdesignschema(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    type: string,

    @Meta(ArgName, 'element')
    @Meta(SchemaType, NS_SYSTEM_BOOL)
    element?: boolean
  ): Promise<string> {
    let nodeType = !type ? undefined : await getNodeType(type);
    if (element && nodeType instanceof ArrayType) nodeType = nodeType.element;
    if (!nodeType) return '';
    const kind = nodeType.kind.toLowerCase();
    return `${NS_SYSTEM_SCHEMA_DESIGN}.${kind}`;
  }
}
