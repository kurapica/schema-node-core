import { Meta } from '../../attribute/meta';
import { ArgName } from '../../schema/function/property/argName';
import { Return } from '../../schema/function/property/return';
import { Require } from '../../property/common/require';
import { SchemaType } from '../../property/core/schemaType';
import { Stackable } from '../../property/core/stackable';
import { Static } from '../../property/core/static';
import { getNodeType } from '../../runtime/context';
import { PropertyType } from '../../schema/property/runtime';
import { OfNodeKind } from '../../property/core/ofNodeKind';
import { Variadic } from '../../schema/function/property/variadic';
import { PropertyValueTypeResolver } from '../../property/core/propertyValueTypeResolver';
import { FunctionType } from '../../schema/function/runtime';

import { NS_SYSTEM_BOOL, NS_SYSTEM_OBJECT, NS_SYSTEM_SCHEMA_KIND, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_PRO_TYPE, NS_SYSTEM_SCHEMA_REFLECT_PROPERTY, NS_SYSTEM_STRING, NODE_KIND_FUNCTION, NS_SYSTEM_LIST, NS_SYSTEM_ENTRY_ACCESS } from '../../utility/constant';
import { _LS, isEmpty } from '../../utility';
import type { Entry, EntryAccess } from '../../struct/entry/type';
import { getSchemaKindSchemaProperties } from '../../runtime/schemaRuntime';
import { Display, setPropertyValue } from '../../property';

@Meta(OfNodeKind, NODE_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_REFLECT_PROPERTY)
export class SystemReflectProperty {

  /** Gets the properties attached to kinds */
  @Meta(Return, `${NS_SYSTEM_LIST}<${NS_SYSTEM_ENTRY_ACCESS}<${NS_SYSTEM_STRING}>>}>`)
  static async getkindproperties(
    @Meta(ArgName, 'kinds')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_KIND)
    @Meta(Variadic, true)
    ...kinds: string[]
  ): Promise<EntryAccess<string>[]>
  {
    const nameSet = new Set<string>();
    const result: Entry<string>[] = [];
    for (let kind of kinds) {
      if (isEmpty(kind)) continue;
      for(const p of getSchemaKindSchemaProperties(kind)){
        const ptype = await getNodeType(p) as PropertyType;
        if (!ptype) continue;
        if (!ptype.property || nameSet.has(ptype.property)) continue;
        nameSet.add(ptype.property);
        if (ptype.getPropertyValue(Static)) continue; // Skip static properties
        const entry: Entry<string> = { value: ptype.property };
        setPropertyValue(entry, Display, ptype.getPropertyValue(Display) ?? _LS(ptype.property));
        result.push(entry);
      }
    }
    return [{ children: result }];
  }

  @Meta(Return, NS_SYSTEM_STRING)
  static async getkindpropvaluetype(
    @Meta(ArgName, 'property')
    @Meta(SchemaType, NS_SYSTEM_STRING)
    property: string,

    @Meta(ArgName, 'kinds')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_KIND)
    @Meta(Variadic, true)
    ...kinds: string[]
  ): Promise<string | undefined>
  {
    if (isEmpty(property)) return undefined;
    property = property.toLowerCase();

    for (let kind of kinds) {
      if (isEmpty(kind)) continue;
      for(const p of getSchemaKindSchemaProperties(kind)){
        const ptype = await getNodeType(p) as PropertyType;
        if (!ptype) continue;
        if (ptype && ptype.property?.toLowerCase() === property) return ptype.valueType?.name;
      }
    }
    return undefined;
  }

  /** Whether the property is static */
  @Meta(Return, NS_SYSTEM_BOOL)
  static async isstatic(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_PRO_TYPE)
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
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_PRO_TYPE)
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
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_PRO_TYPE)
    type: string
  ): Promise<boolean>
  {
    return !await SystemReflectProperty.isstatic(type);
  }

  /** Whether the property is not stackable */
  @Meta(Return, NS_SYSTEM_BOOL)
  static async notstackable(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_PRO_TYPE)
    type: string
  ): Promise<boolean>
  {
    return !await SystemReflectProperty.isstackable(type);
  }

  /** Gets the property value type */
  @Meta(Return, NS_SYSTEM_STRING)
  static async getvaluetype(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_PRO_TYPE)
    @Meta(Require, true)
    type: string,

    @Meta(ArgName, 'ownerType')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
    ownerType: string
  ): Promise<string | undefined> {
    const prop = !type ? undefined : await getNodeType(type) as PropertyType | undefined;
    const resolver = prop?.getPropertyValue<string>(PropertyValueTypeResolver);
    if (resolver) {
      const resolveType = await getNodeType(resolver) as FunctionType;
      const type = await resolveType.call([ownerType]) as string;
      if (type) return type;
    }

    // default
    const name = prop?.valueType?.name;
    return name === NS_SYSTEM_OBJECT && ownerType ? ownerType : name;
  }

  /** Whether the property is for schema */
  @Meta(Return, NS_SYSTEM_BOOL)
  static async forschema(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_PRO_TYPE)
    type: string,

    @Meta(ArgName, 'kind')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_KIND)
    @Meta(Variadic, true)
    ...kinds: string[]
  ): Promise<boolean> {
    if (!kinds.length) return false;
    const prop = !type ? undefined : await getNodeType(type);
    return prop instanceof PropertyType && kinds.some(kind => prop.forSchema(kind)) || false;
  }
}