import { Meta } from "../../attribute";
import { ArgName, Require, Return, SchemaType, Stackable, Static } from "../../property";
import { getNodeType, PropertyType } from "../../runtime";
import { NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_PROPERTY_TYPE, NS_SYSTEM_SCHEMA_REFLECT_PROPERTY, NS_SYSTEM_STRING } from "../../utility";

@Meta(SchemaType, NS_SYSTEM_SCHEMA_REFLECT_PROPERTY)
export class SystemReflectProperty {
  /** Whether the property is static */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_PROPERTY}.isstatic`)
  @Meta(Return, NS_SYSTEM_BOOL)
  static async isstatic(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_PROPERTY_TYPE)
    type: string
  ): Promise<boolean>
  {
    var propType = type ? await getNodeType(type) as PropertyType : undefined;
    if (!propType) return false
    return propType.getProperty(Static)?.getValue<boolean>() ?? false;
  }

  /** Whether the property is stackable */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_PROPERTY}.isstackable`)
  @Meta(Return, NS_SYSTEM_BOOL)
  static async isstackable(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_PROPERTY_TYPE)
    type: string
  ): Promise<boolean>
  {
    var propType = type ? await getNodeType(type) as PropertyType : undefined;
    if (!propType) return false
    return propType.getProperty(Stackable)?.getValue<boolean>() ?? false;
  }

  /** Whether the property is not static */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_PROPERTY}.notstatic`)
  @Meta(Return, NS_SYSTEM_BOOL)
  static async notstatic(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_PROPERTY_TYPE)
    type: string
  ): Promise<boolean>
  {
    return !await this.isstatic(type);
  }

  /** Whether the property is not stackable */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_PROPERTY}.notstackable`)
  @Meta(Return, NS_SYSTEM_BOOL)
  static async notstackable(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_PROPERTY_TYPE)
    type: string
  ): Promise<boolean>
  {
    return !await this.isstackable(type);
  }

  /** Gets the property value type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_PROPERTY}.getpropertyvaluetype`)
  @Meta(Return, NS_SYSTEM_STRING)
  static async getvaluetype(
    @Meta(ArgName, 'name')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_PROPERTY_TYPE)
    @Meta(Require, true)
    name: string,
  ): Promise<string | undefined> {
    const prop = !name ? undefined : await getNodeType(name) as PropertyType | undefined;
    return prop?.valueType?.name;
  }
}
