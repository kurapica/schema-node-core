// =============================================================================
// Mirros C# SchemaNode.Core/Schema/EnumSchema.cs
// =============================================================================

import { Meta, getMetaProperty } from '../attribute/meta';
import { SchemaKind, NodeSchemaKind, ValueSchemaKind, SchemaType, Attach, ForSchema, OfSchema, SchemaGenerator, UniqueIndex, Visible, getRecordedValues, Display } from '../property/index';
import { IProperty, Property } from '../property/property';
import { SCHEMA_KIND_ENUM, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_ENUM, NS_SYSTEM_SCHEMA_PROPERTY_CORE, SCHEMA_KIND_ORDER_ENUM, NS_SYSTEM_LIST, NS_SYSTEM_LOCALE_STRING, SCHEMA_KIND_STRUCT, SCHEMA_KIND_ENUM_VALUE, SCHEMA_KIND_ORDER_ENUM_VALUE, PRIMARY_KEY_MAX_LEN, NS_SYSTEM_STRING, NS_SYSTEM_BOOL, NS_SYSTEM_LOGIC_EQ, NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_STRING } from '../utility/constant';
import { EnumValueType, type EnumValueTypeValue } from '../enum/enumValueType';
import { concatLocaleString, LocaleString } from '../struct';
import { RuntimeNodeType } from '../property/core/RuntimeNodeType';
import { EnumType } from '../runtime/type';
import { PrimaryIndex, Require, UpLimitString, Valid } from '../property/constraint';
import { Relation } from '../attribute/relation';
import { combineProperties, setPropertyValue } from '../property/propertyOwner';
import { NodeSchema } from './nodeSchema';
import { FromEnum } from '../property/core/fromEnum';
import { combinePaths } from '../utility/toolset';
import { saveSchema } from '../runtime/schemaRuntime';
import { Base } from '../property/core/base';

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

    // combine cascade
    if (selfSchema.cascade?.length && otherSchema.cascade?.length)
    {
      for (let i = 0; i < Math.min(selfSchema.cascade.length, otherSchema.cascade.length); i++)
        selfSchema.cascade[i] = concatLocaleString(selfSchema.cascade[i], otherSchema.cascade[i]);
    }

    // combine enum values
    for (let i = 0; i < Math.min(selfSchema.values.length, otherSchema.values.length); i++)
      combineProperties(selfSchema.values[i], otherSchema.values[i], SCHEMA_KIND_ENUM_VALUE);

    // combine properties
    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_ENUM);
    this.setValue(selfSchema);
    return true;
  }
}

/** Represents the enum value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.type`)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, { func: NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, args: [ { source: NODE_SELF }, { value: SCHEMA_KIND_ENUM }] } )
class StringTypeMeta {}

function generateEnumSchema(namespace: string, name: string, ctor: Function) {
  const nodeSchema : NodeSchema = { namespace, name, kind: SCHEMA_KIND_ENUM }

  const enumSchema : EnumSchema = { type: EnumValueType.String, values: [] }

  const forEnum = getMetaProperty(ctor, FromEnum)?.getValue();
  const enumName = combinePaths(namespace, name);
  if (forEnum)
  {
    enumSchema.values = buildEnumValues(enumName, forEnum);
  }
  else
  {
    // record
    const values = getRecordedValues(ctor);
    enumSchema.values = values.map(v => (setPropertyValue({ value: v.getValue<string>()! }, Display, { key: `${enumName}.${v.getValue<string>()!}`})));
  }
  if (!enumSchema.values?.length) return;
  enumSchema.type = inferEnumType(enumSchema.values);
  setPropertyValue(nodeSchema, Display, { key: combinePaths(namespace, name) });
  setPropertyValue(nodeSchema, EnumProperty, enumSchema);
  saveSchema(nodeSchema);
}

function buildEnumValues(enumName: string, target: object): EnumValueSchema[] {
  const values: EnumValueSchema[] = [];
  for (const key of Object.getOwnPropertyNames(target).filter(k => k !== 'prototype' && k !== 'length' && k !== 'name')) {
    const val = (target as Record<string, unknown>)[key];
    if (typeof val === 'string' || typeof val === 'number') 
      values.push(setPropertyValue({ value: String(val) }, Display, { key: `${enumName}.${key}` }));
  }
  return values;
}

function inferEnumType(values: EnumValueSchema[]): EnumValueTypeValue {
  if (values.length > 0 && values.every((v) => !isNaN(Number(v.value)))) return EnumValueType.Int;
  return EnumValueType.String;
}
