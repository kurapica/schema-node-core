import { Meta } from '../../attribute/meta';
import { ArgName } from '../../schema/function/property/argName';
import { Return } from '../../schema/function/property/return';
import { Require } from '../../property/common/require';
import { SchemaType } from '../../property/core/schemaType';
import { Stackable } from '../../property/core/stackable';
import { Static } from '../../property/core/static';
import { getNodeType } from '../../runtime/context';
import { PropertyType } from '../../schema/property/runtime';

import { NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_KIND, NS_SYSTEM_SCHEMA_PROPERTY_TYPE, NS_SYSTEM_SCHEMA_REFLECT_PROPERTY, NS_SYSTEM_STRING, SCHEMA_KIND_FUNCTION } from '../../utility/constant';
import { OfSchema } from '../../property';

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_REFLECT_PROPERTY)
export class SystemReflectProperty {
  /** Whether the property is static */
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
  @Meta(Return, NS_SYSTEM_BOOL)
  static async notstatic(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_PROPERTY_TYPE)
    type: string
  ): Promise<boolean>
  {
    return !await SystemReflectProperty.isstatic(type);
  }

  /** Whether the property is not stackable */
  @Meta(Return, NS_SYSTEM_BOOL)
  static async notstackable(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_PROPERTY_TYPE)
    type: string
  ): Promise<boolean>
  {
    return !await SystemReflectProperty.isstackable(type);
  }

  /** Gets the property value type */
  @Meta(Return, NS_SYSTEM_STRING)
  static async getvaluetype(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_PROPERTY_TYPE)
    @Meta(Require, true)
    type: string,
  ): Promise<string | undefined> {
    const prop = !type ? undefined : await getNodeType(type) as PropertyType | undefined;
    return prop?.valueType?.name;
  }

  /** Whether the property is for schema */
  @Meta(Return, NS_SYSTEM_BOOL)
  static async forschema(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_PROPERTY_TYPE)
    type: string,

    @Meta(ArgName, 'kind')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_KIND)
    kind: string
  ): Promise<boolean>
  {
    if (!kind) return false;
    const prop = !type ? undefined : await getNodeType(type) as PropertyType | undefined;
    if (!prop) return false;
    return prop.forSchemas?.some(k => k.toLowerCase() === kind.toLowerCase()) ?? false;
  }
}