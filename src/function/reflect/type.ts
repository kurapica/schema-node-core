import { Meta } from '../../attribute/meta';
import { OfSchema } from '../../property/core/ofSchema';
import { SchemaType } from '../../property/core/schemaType';
import { Return } from '../../property/function/return';
import { ArgName } from '../../property/function/argName';
import { setPropertyValue, getPropertyValue } from '../../property/propertyOwner';
import { Display } from '../../property/common/display';
import { Require } from '../../property/constraint/require';
import { Variadic } from '../../property/function/variadic';
import { getRecordedValues } from '../../property/recordProperty';
import { ValueSchemaKind } from '../../property/record/valueSchemaKind';
import { combinePaths, isNull } from '../../utility/toolset';
import { getNodeType } from '../../runtime/context';
import { ValueType } from '../../schema/value/runtime';
import { ArrayType } from '../../schema/array/runtime';
import { isNamespaceNodeType } from '../../interface';

import type { EntryAccess, Entry } from '../../struct/entry/type';
import type { LocaleString } from '../../struct/localeString/type';

import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_SCHEMA_REFLECT_TYPE, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_NODE_TYPE, NS_SYSTEM_LIST, NS_SYSTEM_ENTRY_ACCESS, SCHEMA_KIND_NAMESPACE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_KIND, NS_SYSTEM_SCHEMA_DESIGN } from '../../utility/constant';
import { NodeSchemaKind } from '../../property';

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_REFLECT_TYPE)
export class SystemReflectType {

  /** Gets the type name of the node schema type */
  @Meta(Return, NS_SYSTEM_STRING)
  static gettypename(
    @Meta(ArgName, 'name')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    name: string,
  ): string {
    return (name ?? '').split('<')[0].split('.').pop() || '';
  }

  /** Gets the full names and labels of the schema nodes under the namespace with the given name */
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
    if (!name && !root && name !== root && !name.startsWith(`${root}.`))
      return [];

    let ns = await getNodeType(name?.length ? name : root);
    if (!ns) return [];

    let result: EntryAccess<string>[] = [];
    const recordes = getRecordedValues(NodeSchemaKind);
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
      if (isNamespaceNodeType(ns))
      {
        const nodeSchemas = Array.from(ns.getSubNodeSchemas());
        nodeSchemas.sort((s1, s2) => {
          const k1 = recordes.find(r => r.getValue<string>()!.toLowerCase() === s1.kind.toLowerCase())?.order ?? 99;
          const k2 = recordes.find(r => r.getValue<string>()!.toLowerCase() === s2.kind.toLowerCase())?.order ?? 99;
          return k1 - k2;
        });

        access.children = nodeSchemas.map(s => {
          return setPropertyValue(
            { value: combinePaths(ns!.name, s.name), hasChildren: s.kind === SCHEMA_KIND_NAMESPACE },
            Display,
            getPropertyValue(s, Display)
          );
        });
      }
      result.push(access);
      if (root && ns?.name === root) break;
      ns = ns.namespace;
    }
    result.reverse();
    return result;
  }

  /** Gets the sub entries of the value type */
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
    ...kinds: string[]
  ): Promise<boolean> {
    const nodeType = !name ? undefined : await getNodeType(name);
    if (!nodeType) return false;
    return kinds.some(kind => {
      if (nodeType.kind.toLowerCase() === kind.toLowerCase()) return true;
      return matchArrayElement && nodeType instanceof ArrayType && nodeType.element?.kind.toLowerCase() === kind.toLowerCase();
    });
  }

  /** hecks if value type of the give access from the type match the given schema kinds */
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
    ...kinds: string[]
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
  @Meta(Return, NS_SYSTEM_BOOL)
  static async isvaluekind(
    @Meta(ArgName, 'name')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    @Meta(Require, true)
    name: string,
  ): Promise<boolean> {
    const nodeType = isNull(name) ? undefined : await getNodeType(name);
    if (!nodeType) return false;
    const valueKinds = getRecordedValues(ValueSchemaKind);
    return valueKinds.some(v => v.getValue<string>()?.toLowerCase() === nodeType.kind.toLowerCase());
  }

  /** Checks if the schema node with the given name is assignable to the schema node with the given target name */
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

  /** Checks if the schema node with the given name is assignable to the schema node with the given target name */
  @Meta(Return, NS_SYSTEM_BOOL)
  static async isaccessassignableto(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    type: string,

    @Meta(ArgName, 'path')
    @Meta(SchemaType, NS_SYSTEM_STRING)
    path: string,

    @Meta(ArgName, 'target')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    target: string,
  ): Promise<boolean> {
    const nodeType = !type ? undefined : await getNodeType(type) as ValueType;
    if (!nodeType) return false;
    const targetNodeType = !target ? undefined : await getNodeType(target) as ValueType;
    if (!targetNodeType) return false;
    return nodeType.getAccessValueType(path)?.isAssignableTo(targetNodeType) ?? false;
  }

  /** The value type is indexable */
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
  @Meta(Return, NS_SYSTEM_STRING)
  static async getdesignschema(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    @Meta(Require, true)
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
