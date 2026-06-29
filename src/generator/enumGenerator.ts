import { NodeSchema } from '../schema/nodeSchema';
import { EnumSchema, type EnumValueInfo } from '../schema/enumSchema';
import type { SchemaRuntime } from '../runtime/schemaRuntime';
import { getMetaProperty } from '../attribute/meta';
import { SchemaType } from '../property/index';
import { EnumValueType, type EnumValueTypeValue } from '../enum/enumValueType';
import { SCHEMA_KIND_ENUM } from '../utility/constant';

export function generateEnumSchema(target: object, runtime: SchemaRuntime): void {
  const schemaTypeProp = getMetaProperty(target as Function, SchemaType);
  if (!schemaTypeProp?.hasValue) return;
  const fullName = schemaTypeProp.getValue<string>()!;
  const lastDot = fullName.lastIndexOf('.');
  const ns = lastDot >= 0 ? fullName.substring(0, lastDot) : '';
  const nm = lastDot >= 0 ? fullName.substring(lastDot + 1) : fullName;
  const enumData = new EnumSchema();
  enumData.values = buildEnumValues(target);
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
