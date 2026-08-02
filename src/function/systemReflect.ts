// =============================================================================
// system.schema.reflect — reflection helpers for the system schema
// Mirrors C# SchemaNode.Core/Function/SystemReflect.cs
// =============================================================================

import { Meta } from '../attribute/meta';
import { OfSchema, SchemaType, Return, ArgName, Require, Variadic } from '../property/index';
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_STRING, NS_SYSTEM_BOOL, NS_SYSTEM_ENTRYS, NS_SYSTEM_SCHEMA_REFLECT, NS_SYSTEM_SCHEMA_REFLECT_FUNC, SCHEMA_KIND_NAMESPACE, SCHEMA_KIND_ARRAY, NS_SYSTEM_SCHEMA_NODE_TYPE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_KIND, NS_SYSTEM_SCHEMA_NAMESPACE_TYPE, NS_SYSTEM_SCHEMA_PROPERTY_TYPE, NS_SYSTEM_SCHEMA_FUNC_TYPE, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT, NS_SYSTEM_LIST } from '../utility/constant';
import { getNodeType } from '../runtime/schemaRuntime';
import { Entry } from '../struct/entry';
import { NamespaceType } from '../runtime/type/namespaceType';
import { ArrayType } from '../runtime/type/arrayType';
import { PropertyType } from '../runtime/type/propertyType';
import { FunctionType } from '../runtime/type/functionType';
import { ValueType } from '../runtime/type/valueType';
import { ValueSchemaKind } from '../property/record/valueSchemaKind';
import { getRecordedValues } from '../property/recordProperty';
import { Display } from '../property/common/index';
import { combineProperties } from '../property/propertyOwner';

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_REFLECT)
export class SystemReflect {
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
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT}.getsubentries`)
  @Meta(Return, `${NS_SYSTEM_ENTRYS}<${NS_SYSTEM_STRING}>`)
  static async getsubentries(
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
    return valueType?.getSubEntries() ?? [];
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
}