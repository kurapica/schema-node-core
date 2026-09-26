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
import { combinePaths, isEmpty, splitString } from '../../utility/toolset';
import { getNodeType } from '../../runtime/context';
import { ValueType } from '../../schema/value/runtime';
import { ArrayType } from '../../schema/array/runtime';
import { SystemReflectType } from './type';
import { EntryRoot } from '../../property/core/entrySource';

import type { EntryAccess, Entry } from '../../struct/entry/type';
import type { LocaleString } from '../../struct/localeString/type';

import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT, NS_SYSTEM_LIST, NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_NODE_TYPE, SCHEMA_KIND_ARRAY, NS_SYSTEM_ENTRY_ACCESS, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, ARRAY_PREVIOUS, ARRAY_ELEMENT } from '../../utility/constant';
import { Variadic } from '../../schema/function/property/variadic';


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
    return `{LIST.PREFIX}{@${element}}{LIST.SUFFIX}`;
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
    if (!path) path = root;

    // first
    const first: (Entry<string> & { display: LocaleString })[]  = [
      { value: ARRAY_PREVIOUS, display: _LS('ARRAY_PREVIOUS'), hasChildren: false },
      { value: ARRAY_ELEMENT, display: _LS('ARRAY_ELEMENT'), hasChildren: elementType.hasAccessEntries },
    ];

    const result: EntryAccess<string>[] = [ { children: first} ];
    let curr = path ? result[0].children?.find(c => c.value.toLowerCase() === path || path.startsWith(`${c.value.toLowerCase()}.`)) : undefined;
    let valueType: ValueType | undefined = curr?.value === ARRAY_ELEMENT ? elementType : undefined;
    while (valueType && curr)
    {
      const accessEntry: EntryAccess<string> = {};
      accessEntry.entry = setPropertyValue(
        { value: curr.value, hasChildren: valueType.hasAccessEntries },
        Display,
        getPropertyValue(curr, Display)
      );
      result.push(accessEntry);
      if (!valueType.hasAccessEntries) break;

      const accesses = valueType.getAccessEntries();
      accessEntry.children = accesses;

      // check next part
      let next: ValueType | undefined;
      let nextCurr: Entry<string> | undefined;
      for (const a of accesses)
      {
        const n = a.value;
        if (curr) a.value = combinePaths(curr.value, n);
        if (path && (path === a.value || path.startsWith(a.value + '.')))
        {
          next = valueType.getAccessValueType(n);
          nextCurr = a;
        }
      }
      curr = nextCurr;
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

    if (path.toLowerCase() === ARRAY_PREVIOUS) return `${NS_SYSTEM_LIST}<${elementType.name}>`;

    const paths = splitString(path, '.', 2);
    return paths[0]?.toLowerCase() === ARRAY_ELEMENT 
      ? paths.length > 1 ? elementType.getAccessValueType(paths[1])?.name : elementType?.name
      : undefined;
  }

  /** Gets the sub entries of the array element type */
  @Meta(Return, `${NS_SYSTEM_LIST}<${NS_SYSTEM_ENTRY_ACCESS}<${NS_SYSTEM_STRING}>>`)
  static async getelementaccessentries(
    @Meta(ArgName, 'name')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
    @Meta(Require, true)
    name: string,

    @Meta(ArgName, 'path')
    @Meta(SchemaType, NS_SYSTEM_STRING)
    path?: string,

    @Meta(ArgName, 'root')
    @Meta(SchemaType, NS_SYSTEM_STRING)
    @Meta(EntryRoot, true)
    root?: string
  ): Promise<EntryAccess<string>[]> {
    let type: ValueType | undefined   = await getNodeType(name) as ValueType;
    type = (type instanceof ArrayType) ? type.element : type;
    return type ? await SystemReflectType.getaccessentries(type.name, path, root) : [];
  }

  /** Gets the value type of the array element field */
  @Meta(Return, NS_SYSTEM_STRING)
  static async getelementaccessvaluetype(
    @Meta(ArgName, 'name')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
    @Meta(Require, true)
    name: string,

    @Meta(ArgName, 'path')
    @Meta(SchemaType, NS_SYSTEM_STRING)
    path: string
  ): Promise<string | undefined> {
    let type: ValueType | undefined   = await getNodeType(name) as ValueType;
    type = (type instanceof ArrayType) ? type.element : type;
    return type ? await SystemReflectType.getaccessvaluetype(type.name, path) : undefined;
  }

  /** Checks if the type is assignable to the array element type */
  @Meta(Return, NS_SYSTEM_BOOL)
  static async isassignabletoelement(
      @Meta(ArgName, 'type')
      @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
      type: string,
  
      @Meta(ArgName, 'target')
      @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
      @Meta(Variadic, true)
      ...targets: string[]
    ): Promise<boolean> {
      const nodeType = type ? await getNodeType(type) : undefined;
      if (!(nodeType instanceof ValueType)) return false;
      for (const target of targets)
      {
        let targetNodeType = !target ? undefined : await getNodeType(target) as ValueType;
        if (targetNodeType instanceof ArrayType) targetNodeType = targetNodeType.element;
        if (targetNodeType && nodeType?.isAssignableTo(targetNodeType)) return true;
      }
      return false;
  }
}