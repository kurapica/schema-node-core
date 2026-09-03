// =============================================================================
// Mirros C# SchemaNode.Core/Schema/EnumSchema.cs
// =============================================================================

import { Meta, getMetaProperty } from '../../attribute/meta';
import { SchemaKind } from '../../property/record/schemaKind';
import { NodeSchemaKind } from '../../property/record/nodeSchemaKind';
import { ValueSchemaKind } from '../../property/record/valueSchemaKind';
import { SchemaType } from '../../property/core/schemaType';
import { Attach } from '../struct/property/attach';
import { OfSchema } from '../../property/core/ofSchema';
import { SchemaGenerator } from '../../property/core/schemaGenerator';
import { getRecordedValues } from '../../property/recordProperty';
import { Display } from '../../property/common/display';
import { EntrySource } from '../../property/core/entrySource';
import { Immutable } from '../../property/common/immutable';
import { OverrideType } from '../../property/core/overrideType';
import { Default } from '../../property/common/default';
import { EnumValueType } from '../../enum/enumValueType/type';
import { RuntimeNodeType } from '../../property/core/runtimeNodeType';
import { Relation } from '../../attribute/relation';
import { setProperty, setPropertyValue } from '../../property/propertyOwner';
import { FromEnum } from '../../property/core/fromEnum';
import { combinePaths } from '../../utility/toolset';
import { getMetaPropertiesForSchema, saveNodeSchema } from '../../runtime/schemaRuntime';
import { Base } from '../../property/core/base';
import { buildFuncCall } from '../../schema/function/type';
import { EnumType } from './runtime';
import { EnumValue } from './property/enumValue';
import { EnumNode, EnumArrayNode } from './node';
import { ArrayDataNodeType, DataNodeType } from '../../property/core/dataNodeType';
import { InVisible } from '../../property/common/invisible';
import { PrimaryIndex } from '../../property/core/indexes';
import { Root } from './property/root';
import { Cascade } from './property/cascade';
import { SchemaUsage } from '../../property/core/schemaUsage';
import { Append } from '../../property/core/append';
import { BlackList } from '../../property/common/blackList';
import { WhiteList } from '../../property/common/whiteList';
import { Valid } from '../../property/common/valid';

import type { EnumValueTypeValue } from '../../enum/enumValueType';
import type { LocaleString } from '../../struct/localeString/type';
import type { Entry } from '../../struct/entry/type';
import type { EnumSchema } from './type';
import type { NodeSchema } from '../node/type';

import { SCHEMA_KIND_ENUM, SCHEMA_KIND_NODE, NS_SYSTEM_SCHEMA_ENUM, SCHEMA_KIND_ORDER_ENUM, NS_SYSTEM_LIST, NS_SYSTEM_LOCALE_STRING, NS_SYSTEM_STRING, NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_STRING, TYPE_PROVIDER, NS_SYSTEM_SCHEMA_REFLECT_ENUM, ARRAY_PREVIOUS, SCHEMA_KIND_ENTRY, ARRAY_ELEMENT, SCHEMA_KIND_ENUM_DEFINE, SCHEMA_KIND_ENUM_USAGE, NS_SYSTEM_INTRINSIC, NS_SYSTEM_LOGIC, NS_SYSTEM_LOGIC_EQ } from '../../utility/constant';
import { Require } from '../../property/common/require';
import { LeafOnly } from './property/leafOnly';
import { SingleFlag } from './property/singleFlag';
import { Visible } from '../../property/common/visible';
import { EnumProperty } from './enum';

/** The enum schema kind */
@Meta(SchemaKind, [SCHEMA_KIND_ENUM, SCHEMA_KIND_ORDER_ENUM])
@Meta(NodeSchemaKind, [SCHEMA_KIND_ENUM, SCHEMA_KIND_ORDER_ENUM])
@Meta(ValueSchemaKind, [SCHEMA_KIND_ENUM, SCHEMA_KIND_ORDER_ENUM])
@Meta(RuntimeNodeType, EnumType)
@Meta(SchemaUsage, `${NS_SYSTEM_SCHEMA_ENUM}.usage`)
@Meta(SchemaGenerator, generateEnumSchema)
@Meta(Append, [EntrySource, Default, BlackList, WhiteList, Valid])
@Meta(DataNodeType, EnumNode)
@Meta(EnumValue)
@Meta(ArrayDataNodeType, EnumArrayNode)
class EnumSchemaKind{}

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_ENUM_DEFINE, SCHEMA_KIND_ORDER_ENUM])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.schema`)
@Meta(Attach, SCHEMA_KIND_ENUM_DEFINE)
class EnumSchemaMeta implements EnumSchema {
  /** The enum value type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.valuetype`)
  @Meta(Require, true)
  type!: EnumValueTypeValue;

  /** The cascade of the enum value */
  @Meta(SchemaType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_LOCALE_STRING}>`)
  @Relation(InVisible, 'call', buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@type', EnumValueType.Flags))
  cascade?: LocaleString[];
  
  /** The root enum values */
  @Meta(SchemaType,  `${NS_SYSTEM_SCHEMA_ENUM}.values`)
  @Meta(Require, true)
  @Relation(Immutable,'assign', true, `values.${ARRAY_ELEMENT}.value`)
  @Relation(OverrideType,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.getvaluetype`, '@type'), `values.${ARRAY_ELEMENT}.value`)
  @Relation(Default,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.getdefaultentryvalue`, '@type', `@values.${ARRAY_PREVIOUS}`), `values.${ARRAY_ELEMENT}.value`)
  values!: Entry<string>[];
}

/** The enum schema usage */
@Meta(SchemaKind, [SCHEMA_KIND_ENUM_USAGE, SCHEMA_KIND_ORDER_ENUM])
@Meta(Append, [Default, BlackList, WhiteList, Valid])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.usage`)
@Meta(Attach, SCHEMA_KIND_ENUM_USAGE)
// default
@Relation(Root,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@root'), 'default')
@Relation(LeafOnly,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@leafOnly'), 'default')
@Relation(Cascade,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@cascade'), 'default')
@Relation(SingleFlag,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@singleFlag'), 'default')
@Relation(WhiteList,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@whiteList'), 'default')
@Relation(BlackList,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@blackList'), 'default')
// blacklist
@Relation(Root,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, "@root"), 'blackList')
@Relation(Cascade,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, "@cascade"), 'blackList')
// whitelist
@Relation(BlackList,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, "@blackList"), 'whiteList')
@Relation(Root,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, "@root"), 'whiteList')
@Relation(Cascade,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, "@cascade"), 'whiteList')
// root
@Relation(Visible,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.hascascade`, TYPE_PROVIDER), 'root')
@Relation(InVisible, 'call', buildFuncCall(`${NS_SYSTEM_LOGIC}.le`, "@cascade", 1), 'root')
@Relation(OverrideType,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, TYPE_PROVIDER), 'root')
@Relation(Cascade,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.getcascade`, TYPE_PROVIDER, "@cascade", -1), 'root')
// cascade
@Relation(Visible,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.hascascade`, TYPE_PROVIDER), 'cascade')
@Relation(EntrySource, 'assign', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.getcascades`, TYPE_PROVIDER), 'cascade')
// leafOnly
@Relation(Visible,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.hascascade`, TYPE_PROVIDER), 'leafOnly')
// singleFlag
@Relation(Visible,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.isenumvaluetype`, TYPE_PROVIDER, EnumValueType.Flags), 'singleFlag')
class EnumUsage {}

@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.value`) // for definition
@Meta(Attach, SCHEMA_KIND_ENTRY)
class EnumValueMeta implements Entry<string> {
  /** The value of the entry */
  @Meta(Require, true)
  @Meta(SchemaType, NS_SYSTEM_STRING)
  @Meta(PrimaryIndex)
  value!: string;

  /** Whether the entry has children, no use in definition */
  hasChildren = false;
}

/** Represents the enum value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.type`)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, false, SCHEMA_KIND_ENUM))
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
    values.sort((a, b) => a.order - b.order);
    enumSchema.values = values.map(v => (setPropertyValue({ value: v.getValue<string>()! }, Display, { key: `${enumName}.${v.getValue<string>()!.toLowerCase()}`})));
  }
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

    if (typeof val=== 'string' || typeof val=== 'number') 
      values.push(setPropertyValue({ value: String(val) }, Display, { key: `${enumName}.${key.toLowerCase()}` }));
  }
  return values;
}

function inferEnumType(values: Entry<string>[]): EnumValueTypeValue {
  if (values.length > 0 && values.every((v) => !isNaN(Number(v.value)))) return EnumValueType.Int;
  return EnumValueType.String;
}
