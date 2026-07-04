// =============================================================================
// EnumSchema — extension data under "enum" key
// =============================================================================

import { Meta, getMetaProperty } from '../attribute/meta';
import { SchemaKind, NodeSchemaKind, ValueSchemaKind, SchemaType, Attach, ForSchema, OfSchema } from '../property/index';
import { Property } from '../property/property';
import { SCHEMA_KIND_ENUM, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_ENUM, NS_SYSTEM_SCHEMA_PROPERTY_CORE } from '../utility/constant';
import { EnumValueType, type EnumValueTypeValue } from '../enum/enumValueType';

export interface EnumValueInfo {
  value: string;
  display?: string;
  children?: EnumValueInfo[];
}

export interface EnumValueAccess {
  value: string;
  hasSub?: boolean;
}

/** Pure data interface. */
export interface EnumSchema {
  type: EnumValueTypeValue;
  cascade?: number;
  root?: string;
  values: EnumValueInfo[];
}

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_ENUM, 8])
@Meta(NodeSchemaKind, [SCHEMA_KIND_ENUM, 8])
@Meta(ValueSchemaKind, [SCHEMA_KIND_ENUM, 8])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.schema`)
@Meta(Attach, SCHEMA_KIND_ENUM)
class EnumSchemaMeta implements EnumSchema {
  type: EnumValueTypeValue = EnumValueType.String;
  cascade?: number;
  root?: string;
  values: EnumValueInfo[] = [];
}

@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.enum`)
export class EnumProperty extends Property<EnumSchema> {}


export function generateEnumSchema(target: object, runtime: SchemaRuntime): void {
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

function buildEnumValues(target: object): EnumValueInfo[] {
  const values: EnumValueInfo[] = [];
  for (const key of Object.getOwnPropertyNames(target).filter(k => k !== 'prototype' && k !== 'length' && k !== 'name')) {
    const val = (target as Record<string, unknown>)[key];
    if (typeof val === 'string' || typeof val === 'number') values.push({ value: String(val) });
  }
  return values;
}

function inferEnumType(values: EnumValueInfo[]): EnumValueTypeValue {
  if (values.length > 0 && values.every((v) => !isNaN(Number(v.value)))) return EnumValueType.Int;
  return EnumValueType.String;
}
