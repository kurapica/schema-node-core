// =============================================================================
// Mirros C# SchemaNode.Core/Schema/EnumSchema.cs
// =============================================================================

import { Meta, getMetaPropertiesForSchema, getMetaProperty } from '../../attribute/meta';
import { SchemaKind } from '../../property/record/schemaKind';
import { NodeSchemaKind } from '../../property/record/nodeSchemaKind';
import { ValueSchemaKind } from '../../property/record/valueSchemaKind';
import { SchemaType } from '../../property/core/schemaType';
import { Attach } from '../../property/core/attach';
import { ForSchema } from '../../property/core/forSchema';
import { OfSchema } from '../../property/core/ofSchema';
import { SchemaGenerator } from '../../property/core/schemaGenerator';
import { Visible } from '../../property/common/visible';
import { getRecordedValues } from '../../property/recordProperty';
import { Display } from '../../property/common/display';
import { PropertyValueType } from '../../property/core/propertyValueType';
import { EntrySource } from '../../property/core/entrySource';
import { Immutable } from '../../property/common/immutable';
import { OverrideType } from '../../property/core/overrideType';
import { Default } from '../../property/common/default';
import { IProperty, Property } from '../../property/property';
import { SCHEMA_KIND_ENUM, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_ENUM, NS_SYSTEM_SCHEMA_PROPERTY_CORE, SCHEMA_KIND_ORDER_ENUM, NS_SYSTEM_LIST, NS_SYSTEM_LOCALE_STRING, NS_SYSTEM_STRING, NS_SYSTEM_LOGIC_EQ, NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_STRING, NS_SYSTEM_ENTRYS, SCHEMA_KIND_ENTRY, NODE_TYPE, ENTRY_ROOT, NS_SYSTEM_SCHEMA_REFLECT_ENUM, ARRAY_PREVIOUS } from '../../utility/constant';
import { EnumValueType, type EnumValueTypeValue } from '../../enum/enumValueType';
import { concatLocaleString, LocaleString } from '../../struct/localeString';
import { RuntimeNodeType } from '../../property/core/runtimeNodeType';
import { EnumType } from '../../runtime/type/enumType';
import { Require } from '../../property/constraint/require';
import { Valid } from '../../property/constraint/valid';
import { Relation } from '../../attribute/relation';
import { combineProperties, setProperty, setPropertyValue } from '../../property/propertyOwner';
import { FromEnum } from '../../property/core/fromEnum';
import { combinePaths } from '../../utility/toolset';
import { saveNodeSchema } from '../../runtime/schemaRuntime';
import { Base } from '../../property/core/base';
import { Call } from '../../relation/call';
import { buildFuncCall } from '../../property/funcCallProperty';
import { Entry } from '../../struct/entry';
import { EnumValue } from '../../property/constraint/enumValue';
import { Assign } from '../../relation/assign';
import { EnumSchema } from './type';
import { NodeSchema } from '../node/type';
import { EnumProperty } from './enum';

/** The enum schema kind */
@Meta(SchemaKind, [SCHEMA_KIND_ENUM, SCHEMA_KIND_ORDER_ENUM])
@Meta(NodeSchemaKind, [SCHEMA_KIND_ENUM, SCHEMA_KIND_ORDER_ENUM])
@Meta(ValueSchemaKind, [SCHEMA_KIND_ENUM, SCHEMA_KIND_ORDER_ENUM])
@Meta(RuntimeNodeType, EnumType)
@Meta(EnumValue)
@Meta(SchemaGenerator, generateEnumSchema)
@Meta(EntrySource, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.getenumaccess`, NODE_TYPE, NODE_SELF, ENTRY_ROOT))
class EnumSchemaKind{}

/** Meta registration class (NOT exported). */
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.schema`)
@Meta(Attach, SCHEMA_KIND_ENUM)
@Relation(Immutable, Assign, true, "values.value")
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
  @Relation(OverrideType, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.getvaluetype`, "@type"))
  @Relation(Default, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.getdefaultentryvalue`, "@type", `@values.${ARRAY_PREVIOUS}`), "values.value")
  values!: Entry<string>[];
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
  saveNodeSchema(nodeSchema);
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
