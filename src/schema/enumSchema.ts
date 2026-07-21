// =============================================================================
// Mirros C# SchemaNode.Core/Schema/EnumSchema.cs
// =============================================================================

import { Meta, getMetaPropertiesForSchema, getMetaProperty } from '../attribute/meta';
import { SchemaKind, NodeSchemaKind, ValueSchemaKind, SchemaType, Attach, ForSchema, OfSchema, SchemaGenerator, Visible, getRecordedValues, Display, PropertyValueType, EntrySource } from '../property/index';
import { IProperty, Property } from '../property/property';
import { SCHEMA_KIND_ENUM, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_ENUM, NS_SYSTEM_SCHEMA_PROPERTY_CORE, SCHEMA_KIND_ORDER_ENUM, NS_SYSTEM_LIST, NS_SYSTEM_LOCALE_STRING, NS_SYSTEM_STRING, NS_SYSTEM_LOGIC_EQ, NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_STRING, NS_SYSTEM_ENTRYS, SCHEMA_KIND_ENTRY, NODE_TYPE, ENTRY_ROOT } from '../utility/constant';
import { EnumValueType, type EnumValueTypeValue } from '../enum/enumValueType';
import { concatLocaleString, LocaleString } from '../struct';
import { RuntimeNodeType } from '../property/core/RuntimeNodeType';
import { EnumType } from '../runtime/type';
import { Require, Valid } from '../property/constraint';
import { Relation } from '../attribute/relation';
import { combineProperties, setProperty, setPropertyValue } from '../property/propertyOwner';
import { NodeSchema } from './nodeSchema';
import { FromEnum } from '../property/core/fromEnum';
import { combinePaths } from '../utility/toolset';
import { saveSystemSchema } from '../runtime/schemaRuntime';
import { Base } from '../property/core/base';
import { Call } from '../relation/call';
import { buildFuncCall } from '../property/funcCallProperty';
import { Entry } from '../struct/entry';
import { EnumValue } from '../property/constraint/enumValue';

/** The enum schema */
export interface EnumSchema {
  /** The enum value type */
  type: EnumValueTypeValue;

  /** The cascade of the enum value */
  cascade?: LocaleString[];
  
  /** The root enum values */
  values: Entry<string>[];
}

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_ENUM, SCHEMA_KIND_ORDER_ENUM])
@Meta(NodeSchemaKind, [SCHEMA_KIND_ENUM, SCHEMA_KIND_ORDER_ENUM])
@Meta(ValueSchemaKind, [SCHEMA_KIND_ENUM, SCHEMA_KIND_ORDER_ENUM])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.schema`)
@Meta(RuntimeNodeType, EnumType)
@Meta(Attach, SCHEMA_KIND_ENUM)
@Meta(EnumValue, true)
@Meta(SchemaGenerator, generateEnumSchema)
@Meta(EntrySource, buildFuncCall('system.data.enum.getenumaccess', NODE_TYPE, NODE_SELF, ENTRY_ROOT))
class EnumSchemaMeta implements EnumSchema {
  /** The enum value type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.valuetype`)
  @Meta(Require, true)
  type!: EnumValueTypeValue;

  /** The cascade of the enum value */
  @Meta(SchemaType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_LOCALE_STRING}>`)
  cascade?: LocaleString[];
  
  /** The root enum values */
  @Meta(SchemaType, `${NS_SYSTEM_ENTRYS}<${NS_SYSTEM_STRING}>`)
  @Meta(Require, true)
  values!: Entry<string>[];
}

/** The enum property of node schema */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.enum`)
@Meta(PropertyValueType, `$${NS_SYSTEM_SCHEMA_ENUM}.schema`)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', SCHEMA_KIND_ENUM))
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
      combineProperties(selfSchema.values[i], otherSchema.values[i], SCHEMA_KIND_ENTRY);

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
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, SCHEMA_KIND_ENUM))
class EnumTypeMeta {}

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

  // build
  setPropertyValue(nodeSchema, Display, { key: combinePaths(namespace, name) });
  getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => setProperty(nodeSchema, p));
  getMetaPropertiesForSchema(SCHEMA_KIND_ENUM, ctor).forEach(p => setProperty(enumSchema, p));  
  setPropertyValue(nodeSchema, EnumProperty, enumSchema);
  saveSystemSchema(nodeSchema);
}

function buildEnumValues(enumName: string, target: object): Entry<string>[] {
  const values: Entry<string>[] = [];
  for (const key of Object.getOwnPropertyNames(target).filter(k => k !== 'prototype' && k !== 'length' && k !== 'name')) {
    const val = (target as Record<string, unknown>)[key];
    if (typeof val === 'string' || typeof val === 'number') 
      values.push(setPropertyValue({ value: String(val) }, Display, { key: `${enumName}.${key}` }));
  }
  return values;
}

function inferEnumType(values: Entry<string>[]): EnumValueTypeValue {
  if (values.length > 0 && values.every((v) => !isNaN(Number(v.value)))) return EnumValueType.Int;
  return EnumValueType.String;
}
