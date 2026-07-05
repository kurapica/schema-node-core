// =============================================================================
// Mirros C# SchemaNode.Core/Schema/EnumSchema.cs
// =============================================================================

import { Meta, getMetaProperty } from '../attribute/meta';
import { SchemaKind, NodeSchemaKind, ValueSchemaKind, SchemaType, Attach, ForSchema, OfSchema, SchemaGenerator, UniqueIndex, Visible } from '../property/index';
import { IProperty, Property } from '../property/property';
import { SCHEMA_KIND_ENUM, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_ENUM, NS_SYSTEM_SCHEMA_PROPERTY_CORE, SCHEMA_KIND_ORDER_ENUM, NS_SYSTEM_LIST, NS_SYSTEM_LOCALE_STRING, SCHEMA_KIND_STRUCT, SCHEMA_KIND_ENUM_VALUE, SCHEMA_KIND_ORDER_ENUM_VALUE, PRIMARY_KEY_MAX_LEN, NS_SYSTEM_STRING, NS_SYSTEM_BOOL, NS_SYSTEM_LOGIC_EQ } from '../utility/constant';
import { EnumValueType, type EnumValueTypeValue } from '../enum/enumValueType';
import { concatLocaleString, LocaleString } from '../struct';
import { RuntimeNodeType } from '../property/core/RuntimeNodeType';
import { EnumType } from '../runtime/type';
import { PrimaryIndex, Require, UpLimitString } from '../property/constraint';
import { Relation } from '../attribute/relation';
import { combineProperties } from '../property/propertyOwner';

/** The enum schema */
export interface EnumSchema {
  /** The enum value type */
  type: EnumValueTypeValue;

  /** The cascade of the enum value */
  cascade?: LocaleString[];
  
  /** The root enum values */
  values: EnumValueSchema[];
}

/** The enum value schema */
export interface EnumValueSchema {
  /** The enum value */
  value: string;

  /** The root value */
  root?: string;
  
  /** Whether has sub list */
  hasSubList?: boolean;

  /** The sub enum values */
  sublist?: EnumValueSchema[];
}

/** The eunm value access info */
export interface EnumValueAccess {
  /** The cascade name */
  name?: LocaleString;

  /** The enum value of the cascade */
  value: string;

  /** The enum value schema */
  schema?: EnumValueSchema;

  /** The sub list of the current */
  sublist?: EnumValueSchema[];
}

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_ENUM, SCHEMA_KIND_ORDER_ENUM])
@Meta(NodeSchemaKind, [SCHEMA_KIND_ENUM, SCHEMA_KIND_ORDER_ENUM])
@Meta(ValueSchemaKind, [SCHEMA_KIND_ENUM, SCHEMA_KIND_ORDER_ENUM])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.schema`)
@Meta(RuntimeNodeType, EnumType)
@Meta(Attach, SCHEMA_KIND_ENUM)
@Meta(SchemaGenerator, generateEnumSchema)
class EnumSchemaMeta implements EnumSchema {
  /** The enum value type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.valuetype`)
  type!: EnumValueTypeValue;

  /** The cascade of the enum value */
  @Meta(SchemaType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_LOCALE_STRING}>`)
  cascade?: LocaleString[];
  
  /** The root enum values */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.values`)
  values!: EnumValueSchema[];
}

/** The enum value schema meta */
@Meta(SchemaKind, [SCHEMA_KIND_ENUM_VALUE, SCHEMA_KIND_ORDER_ENUM_VALUE])
@Meta(OfSchema, SCHEMA_KIND_STRUCT)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.value`)
@Meta(Attach, SCHEMA_KIND_ENUM_VALUE)
class EnumValueSchemaMeta implements EnumValueSchema {
  /** The enum value */
  @Meta(PrimaryIndex, 0)
  @Meta(UniqueIndex, ['SUB_LIST', 1])
  @Meta(UpLimitString, PRIMARY_KEY_MAX_LEN)
  @Meta(SchemaType, NS_SYSTEM_STRING)
  @Meta(Require, true)
  value!: string;

  /** The root value */
  @Meta(UniqueIndex, ['SUB_LIST', 0])
  @Meta(UpLimitString, PRIMARY_KEY_MAX_LEN)
  @Meta(SchemaType, NS_SYSTEM_STRING)
  root?: string | undefined;

  /** Whether has sub enum list */
  @Meta(SchemaType, NS_SYSTEM_BOOL)
  hasSubList?: boolean | undefined;

  /** The enum sub list */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.values`)
  sublist?: EnumValueSchema[] | undefined;
}

/** The enum property of node schema */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.enum`)
@Relation(Visible, NS_SYSTEM_LOGIC_EQ, '$kind', SCHEMA_KIND_ENUM)
export class EnumProperty extends Property<EnumSchema> {
  combine(other: IProperty): boolean {
    const otherSchema = other?.getValue<EnumSchema>();
    if (!otherSchema) return false;
    const selfSchema = this.getValue<EnumSchema>();
    if (!selfSchema)
    {
      this.setValue(otherSchema);
      return true;
    }

    if (selfSchema.cascade?.length && otherSchema.cascade?.length)
    {
      for (let i = 0; i < Math.min(selfSchema.cascade.length, otherSchema.cascade.length); i++)
      {
        const c = selfSchema.cascade[i];
        const o = otherSchema.cascade[i];
        selfSchema.cascade[i] = concatLocaleString(c, o);
      }
    }

    for (let i = 0; i < Math.min(selfSchema.values.length, otherSchema.values.length); i++)
    {
      combineProperties(selfSchema.values[i], otherSchema.values[i], SCHEMA_KIND_ENUM_VALUE);
    }

    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_ENUM);
    this.setValue(selfSchema);
    return true;
  }
}

function generateEnumSchema(namespace: string, name: string, enumDefine: object): void {
  const schemaTypeProp = getMetaProperty(target as Function, SchemaType);
  if (!schemaTypeProp?.hasValue) return;
  const fullName = schemaTypeProp.getValue<string>()!;
  const lastDot = fullName.lastIndexOf('.');
  const ns = lastDot >= 0 ? fullName.substring(0, lastDot) : '';
  const nm = lastDot >= 0 ? fullName.substring(lastDot + 1) : fullName;
  const enumData: EnumSchema = {
    values: buildEnumValues(target),
    type: EnumValueType.String,
  };
  enumData.type = inferEnumType(enumData.values);
  const node = new NodeSchema(nm, SCHEMA_KIND_ENUM, ns);
  node.extensions = { enum: enumData };
  runtime.saveSchema(node);
}


export function registerEnumGenerator(runtime: SchemaRuntime): void {
  runtime.registerSchemaKind(SCHEMA_KIND_ENUM, { generator: generateEnumSchema });
}

function buildEnumValues(target: object): EnumValueSchema[] {
  const values: EnumValueSchema[] = [];
  for (const key of Object.getOwnPropertyNames(target).filter(k => k !== 'prototype' && k !== 'length' && k !== 'name')) {
    const val = (target as Record<string, unknown>)[key];
    if (typeof val === 'string' || typeof val === 'number') values.push({ value: String(val) });
  }
  return values;
}

function inferEnumType(values: EnumValueSchema[]): EnumValueTypeValue {
  if (values.length > 0 && values.every((v) => !isNaN(Number(v.value)))) return EnumValueType.Int;
  return EnumValueType.String;
}
