import { Meta } from "../../attribute";
import { OfSchema, SchemaType, Return, ArgName, Require, getRecordedValues, ValueSchemaKind } from "../../property";
import { getNodeType, ValueType, ArrayType } from "../../runtime";
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT, NS_SYSTEM_LIST, NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_NODE_TYPE, SCHEMA_KIND_ARRAY } from "../../utility";


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
  
    /** Checks if the schema kind of the schema node with the given name is a value schema kind and not array schema kind */
    @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.isarrayele`)
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