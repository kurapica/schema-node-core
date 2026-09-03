import { Meta } from '../../attribute/meta';
import { OfSchema } from '../../property/core/ofSchema';
import { SchemaType } from '../../property/core/schemaType';
import { Return } from '../../schema/function/property/return';
import { ArgName } from '../../schema/function/property/argName';
import { Require } from '../../property/common/require';
import { getRecordedValues } from '../../property/recordProperty';
import { ValueSchemaKind } from '../../property/record/valueSchemaKind';
import { Display } from '../../property/common/display';
import { getPropertyValue, setPropertyValue } from '../../property/propertyOwner';
import { _LS } from '../../utility/locale';
import { combinePaths, isEmpty } from '../../utility/toolset';
import { getNodeType } from '../../runtime/context';
import { ValueType } from '../../schema/value/runtime';
import { ArrayType } from '../../schema/array/runtime';

import type { EntryAccess, Entry } from '../../struct/entry/type';

import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT, NS_SYSTEM_LIST, NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_NODE_TYPE, SCHEMA_KIND_ARRAY, NS_SYSTEM_ENTRY_ACCESS, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, ARRAY_PREVIOUS, ARRAY_ELEMENT, NODE_SELF } from '../../utility/constant';
import { EntryRoot } from '../../property/core/entrySource';


@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_REFLECT_ARRAY)
export class SystemReflectArray {
  /** Generates the array name for the given element type */
  @Meta(Return, NS_SYSTEM_STRING)
  static async genarrayname(
    @Meta(ArgName, 'element')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT)
    @Meta(Require, true)
    element: string,
  ): Promise<string> {
    if (isEmpty(element)) return "";
    const split = element.split('<')[0].split('.');
    return `${split[split.length - 1]}s`;
  }

  /** Generates the array display name for the given element type */
  @Meta(Return, NS_SYSTEM_STRING)
  static async genarraydisplay(
    @Meta(ArgName, 'element')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT)
    @Meta(Require, true)
    element: string,
  ): Promise<string> {
    if (isEmpty(element)) return "";
    return `{LIST.PREFIX}{${element}}{LIST.SUFFIX}`;
  }

  /** Gets the array type for the given element type */
  @Meta(Return, NS_SYSTEM_STRING)
  static async getarraytype(
    @Meta(ArgName, 'element')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT)
    @Meta(Require, true)
    element: string,
  ): Promise<string> {
    const elementType = element ? await getNodeType(element) as ValueType : undefined;
    if (!elementType) return "";
    if (elementType instanceof ArrayType) return elementType.name;
    if (elementType?.arrayType) return elementType.arrayType.name;
    return `${NS_SYSTEM_LIST}<${elementType.name}>`;
  }

  /** Gets the array element type for the given element type */
  @Meta(Return, NS_SYSTEM_STRING)
  static async getarrayelement(
    @Meta(ArgName, 'array')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT)
    @Meta(Require, true)
    array: string,
  ): Promise<string> {
    const arrayType = await getNodeType(array) as ValueType | undefined;
    if (!arrayType) return "";
    return (arrayType instanceof ArrayType) ? arrayType.element!.name : arrayType.name;
  }

  /** Checks if the schema kind of the schema node with the given name is a value schema kind and not array schema kind */
  @Meta(Return, NS_SYSTEM_BOOL)
  static async isarrayele(
    @Meta(ArgName, 'name')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    @Meta(Require, true)
    name: string,
  ): Promise<boolean> {
    const nodeType = !name ? undefined : await getNodeType(name);
    if (!nodeType) return false;
    if (nodeType.kind.toLowerCase() === SCHEMA_KIND_ARRAY.toLowerCase()) return false;
    const valueKinds = getRecordedValues(ValueSchemaKind);
    return valueKinds.some(v => v.getValue<string>()?.toLowerCase() === nodeType.kind.toLowerCase());
  }
  
  /** Gets the sub entries of the value type */
  @Meta(Return, `${NS_SYSTEM_LIST}<${NS_SYSTEM_ENTRY_ACCESS}<${NS_SYSTEM_STRING}>>`)
  static async getaccessentries(
    @Meta(ArgName, 'element')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
    @Meta(Require, true)
    element: string,

    @Meta(ArgName, 'path')
    @Meta(SchemaType, NS_SYSTEM_STRING)
    path?: string,

    @Meta(ArgName, 'root')
    @Meta(SchemaType, NS_SYSTEM_STRING)
    @Meta(EntryRoot, true)
    root?: string
  ): Promise<EntryAccess<string>[]> {
    const elementType = element ? await getNodeType(element) as ValueType : undefined;
    if (!elementType) return [];

    path = path?.toLowerCase() ?? '';
    root = root?.toLowerCase() ?? '';
    if (path && root && path !== root && !path.startsWith(`${root}.`)) return [];
    if (!root) root = path;

    // first
    const first: Entry<string>[] = [
      { value: ARRAY_PREVIOUS, hasChildren: false },
      { value: ARRAY_ELEMENT, hasChildren: false },
    ];
    for(const e of elementType.getAccessEntries())
      first.push(e);

    const result: EntryAccess<string>[] = [ { children: first} ];
    let curr = result[0].children?.find(c => c.value.toLowerCase() === root || root.startsWith(`${c.value.toLowerCase()}.`));
    let valueType = curr ? elementType.getAccessValueType(curr.value) : undefined;
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

  /** Gets the value type of the array field */
  @Meta(Return, NS_SYSTEM_STRING)
  static async getaccessvaluetype(
    @Meta(ArgName, 'element')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
    @Meta(Require, true)
    element: string,

    @Meta(ArgName, 'path')
    @Meta(SchemaType, NS_SYSTEM_STRING)
    path: string
  ): Promise<string | undefined> {
    if (!path) return undefined;
    const elementType = element ? await getNodeType(element) as ValueType : undefined;
    if (!elementType) return undefined;
    if (path.toLowerCase() === NODE_SELF || path.toLowerCase() === ARRAY_PREVIOUS) return `${NS_SYSTEM_LIST}<${elementType.name}>`;
    if (path.toLowerCase() === ARRAY_ELEMENT) return elementType?.name;
    return elementType.getAccessValueType(path)?.name;
  }
}