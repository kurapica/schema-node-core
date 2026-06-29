import { NodeSchema } from '../schema/nodeSchema';
import { StructSchema, type StructFieldSchema } from '../schema/structSchema';
import type { SchemaRuntime } from '../runtime/schemaRuntime';
import { getMetaProperty } from '../attribute/meta';
import { SchemaType } from '../property/index';
import { SCHEMA_KIND_STRUCT } from '../utility/constant';

export function generateStructSchema(target: object, runtime: SchemaRuntime): void {
  const schemaTypeProp = getMetaProperty(target as Function, SchemaType);
  if (!schemaTypeProp?.hasValue) return;
  const fullName = schemaTypeProp.getValue<string>()!;
  const lastDot = fullName.lastIndexOf('.');
  const ns = lastDot >= 0 ? fullName.substring(0, lastDot) : '';
  const nm = lastDot >= 0 ? fullName.substring(lastDot + 1) : fullName;
  const structData = new StructSchema();
  structData.fields = buildStructFields(target);
  const node = new NodeSchema(nm, SCHEMA_KIND_STRUCT, ns);
  node.extensions = { struct: structData };
  runtime.saveSchema(node);
}

export function registerStructGenerator(runtime: SchemaRuntime): void {
  runtime.registerSchemaKind(SCHEMA_KIND_STRUCT, { generator: generateStructSchema });
}

function buildStructFields(target: object): StructFieldSchema[] {
  const fields: StructFieldSchema[] = [];
  const proto = (target as { prototype?: object }).prototype;
  if (!proto) return fields;
  const metaStore = (proto as Record<symbol, Array<{ property: { _memberKey?: string } }>>)[Symbol.for('schema-node:meta')];
  if (!metaStore) return fields;
  let seqno = 0;
  for (const entry of metaStore) {
    const p = entry.property;
    if (!p._memberKey || !(entry.property instanceof SchemaType)) continue;
    fields.push({ name: p._memberKey, type: (entry.property as SchemaType).getValue<string>()!, seqno: seqno++, extensions: {} });
  }
  return fields;
}
