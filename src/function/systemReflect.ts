// =============================================================================
// system.schema.reflect — reflection helpers for the system schema
// Mirrors C# SchemaNode.Core/Function/SystemReflect.cs
// =============================================================================

import { Meta } from '../attribute/meta';
import { OfSchema, SchemaType, Return, ArgName, Require, Variadic } from '../property/index';
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_STRING, NS_SYSTEM_BOOL, NS_SYSTEM_ENTRYS, NS_SYSTEM_SCHEMA_REFLECT, NS_SYSTEM_SCHEMA_REFLECT_FUNC, SCHEMA_KIND_NAMESPACE, SCHEMA_KIND_ARRAY, NS_SYSTEM_SCHEMA_NODE_TYPE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_KIND, NS_SYSTEM_SCHEMA_NAMESPACE_TYPE, NS_SYSTEM_SCHEMA_PROPERTY_TYPE, NS_SYSTEM_SCHEMA_FUNC_TYPE, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT, NS_SYSTEM_LIST, NS_SYSTEM_SCHEMA_REFLECT_ENUM, NS_SYSTEM_SCHEMA_ENUM, NS_SYSTEM_INT, NS_SYSTEM_SCHEMA_DESIGN } from '../utility/constant';
import { getNodeType } from '../runtime/schemaRuntime';
import { Entry, EntryAccess } from '../struct/entry';
import { NamespaceType } from '../runtime/type/namespaceType';
import { ArrayType } from '../runtime/type/arrayType';
import { PropertyType } from '../runtime/type/propertyType';
import { FunctionType } from '../runtime/type/functionType';
import { ValueType } from '../runtime/type/valueType';
import { ValueSchemaKind } from '../property/record/valueSchemaKind';
import { getRecordedValues } from '../property/recordProperty';
import { Display } from '../property/common/index';
import { combineProperties, setPropertyValue } from '../property/propertyOwner';
import { EnumValueType } from '../enum';
import { EnumType } from '../runtime';

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_REFLECT)
export class SystemReflect {

  /** Gets the type name of the node schema type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT}.gettypename`)
  @Meta(Return, NS_SYSTEM_STRING)
  static gettypename(
    @Meta(ArgName, 'name')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    name: string,
  ): string {
    return name.split('<')[0].split('.').pop() || '';
  }

  /** Gets the full names and labels of the schema nodes under the namespace with the given name */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT}.gettypes`)
  @Meta(Return, `${NS_SYSTEM_ENTRYS}<${NS_SYSTEM_STRING}>`)
  static async gettypes(
    @Meta(ArgName, 'name')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NAMESPACE_TYPE)
    name?: string,
  ): Promise<Entry<string>[]> {
    const ns = await getNodeType(name ?? '');
    if (!(ns instanceof NamespaceType)) return [];
    const entries: Entry<string>[] = [];
    for (const nodeType of ns.children.values()) {
      const entry: Entry<string> = {
        value: nodeType.name,
        hasChildren: nodeType.kind === SCHEMA_KIND_NAMESPACE,
      };
      const display = nodeType.getProperty(Display);
      if (display) {
        combineProperties(entry, display, SCHEMA_KIND_NAMESPACE);
      }
      entries.push(entry);
    }
    return entries;
  }

  /** Gets the property value type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT}.getproptype`)
  @Meta(Return, NS_SYSTEM_STRING)
  static async getproptype(
    @Meta(ArgName, 'name')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_PROPERTY_TYPE)
    @Meta(Require, true)
    name: string,
  ): Promise<string | undefined> {
    const prop = !name ? undefined : await getNodeType(name) as PropertyType | undefined;
    return prop?.valueType?.name;
  }

  /** Gets the sub entries of the value type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT}.getaccessentries`)
  @Meta(Return, `${NS_SYSTEM_ENTRYS}<${NS_SYSTEM_STRING}>`)
  static async getaccessentries(
    @Meta(ArgName, 'name')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
    @Meta(Require, true)
    name: string,

    @Meta(ArgName, 'path')
    @Meta(SchemaType, NS_SYSTEM_STRING)
    path?: string,
  ): Promise<Entry<string>[]> {
    let valueType = !name ? undefined : await getNodeType(name) as ValueType | undefined;
    if (!valueType) return [];
    
    if (path)
      valueType = valueType.getAccessValueType(path);
    return valueType?.getAccessEntries() ?? [];
  }

  /** Checks if the schema kind of the schema node with the given name is the same as the given kind */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT}.isschemakind`)
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

  /** Checks if the schema kind of the schema node with the given name is a value schema kind */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT}.isvaluekind`)
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

  /** Checks if the schema kind of the schema node with the given name is a value schema kind and not array schema kind */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT}.isarrayele`)
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

  /** Gets the design schema name of the given schema kind */
  static getdesignschema(
    @Meta(ArgName, 'kind')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_KIND)
    kind: string,
  ): string {
    return `${NS_SYSTEM_SCHEMA_DESIGN}.${kind}`;
  }
}

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_REFLECT_FUNC)
export class SystemReflectFunction {
  /** Checks if the function type's return type match the given type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.withreturn`)
  @Meta(Return, NS_SYSTEM_BOOL)
  static async withreturn(
    @Meta(ArgName, 'func')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_FUNC_TYPE)
    @Meta(Require, true)
    func: string,

    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
    @Meta(Require, true)
    type: string,

    @Meta(ArgName, 'matchArrayElement')
    @Meta(SchemaType, NS_SYSTEM_BOOL)
    matchArrayElement: boolean = false,
  ): Promise<boolean> {
    const nodeType = !func ? undefined : await getNodeType(func) as FunctionType | undefined;
    const returnType = !type ? undefined : await getNodeType(type) as ValueType | undefined;
    if (!nodeType?.returnType || !returnType) return false;
    
    if (nodeType.returnType.isAssignableTo(returnType)) return true;
    
    if (matchArrayElement && returnType instanceof ArrayType && returnType.element) {
      return nodeType.returnType.isAssignableTo(returnType.element);
    }
    
    return false;
  }

  /** Checks if the function type's argument match the given types */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.withargs`)
  @Meta(Return, NS_SYSTEM_BOOL)
  static async withargs(
    @Meta(ArgName, 'func')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    @Meta(Require, true)
    func: string,

    @Meta(ArgName, 'args')
    @Meta(SchemaType, `${NS_SYSTEM_ENTRYS}<${NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE}>`)
    args: string[],
  ): Promise<boolean> {
    const funcType = !func ? undefined : await getNodeType(func) as FunctionType | undefined;
    if (!funcType || args.length !== funcType.args.length) return false;
    
    for (let i = 0; i < args.length; i++) {
      const argType = !args[i] ? undefined : await getNodeType(args[i]) as ValueType | undefined;
      if (!argType) return false;
      
      const funcArgType = await getNodeType(funcType.args[i].type) as ValueType | undefined;
      if (!funcArgType || !funcArgType.isAssignableTo(argType)) return false;
    }
    
    return true;
  }
}

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_REFLECT_ARRAY)
export class SystemReflectArray {
  /** Generates the array name for the given element type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.genarrayname`)
  @Meta(Return, NS_SYSTEM_STRING)
  static async genarrayname(
    @Meta(ArgName, 'element')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT)
    @Meta(Require, true)
    element: string,
  ): Promise<string> {
    const split = element.split('<')[0].split('.');
    return `${split[split.length - 1]}s`;
  }

  /** Generates the array display name for the given element type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.genarraydisplay`)
  @Meta(Return, NS_SYSTEM_STRING)
  static async genarraydisplay(
    @Meta(ArgName, 'element')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT)
    @Meta(Require, true)
    element: string,
  ): Promise<string> {
    return `{LIST.PREFIX}{${element}}{LIST.SUFFIX}`;
  }

  /** Gets the array type for the given element type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getarraytype`)
  @Meta(Return, NS_SYSTEM_STRING)
  static async getarraytype(
    @Meta(ArgName, 'element')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT)
    @Meta(Require, true)
    element: string,
  ): Promise<string> {
    const elementType = await getNodeType(element) as ValueType | undefined;
    if (!elementType) return "";
    if (elementType instanceof ArrayType) return elementType.name;
    if (elementType?.arrayType) return elementType.arrayType.name;
    return `${NS_SYSTEM_LIST}<${elementType.name}>`;
  }

  /** Gets the array element type for the given element type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getarrayelement`)
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
}

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
    @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.type`)
    @Meta(Require, true)
    type: string,
  ): Promise<boolean> {
    const enumType = await getNodeType(type) as EnumType | undefined;
    return !!enumType?.cascade?.length;
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