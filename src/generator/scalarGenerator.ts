import { NodeSchema } from '../schema/nodeSchema';
import type { SchemaRuntime } from '../runtime/schemaRuntime';
import { getMetaProperty } from '../attribute/meta';
import { SchemaType } from '../property/index';
import { SCHEMA_KIND_BOOL, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING, SCHEMA_KIND_DATE } from '../utility/constant';

function generateScalarSchema(target: object, runtime: SchemaRuntime): void {
  const schemaTypeProp = getMetaProperty(target as Function, SchemaType);
  if (!schemaTypeProp?.hasValue) return;
  const fullName = schemaTypeProp.getValue<string>()!;
  const lastDot = fullName.lastIndexOf('.');
  const ns = lastDot >= 0 ? fullName.substring(0, lastDot) : '';
  const nm = lastDot >= 0 ? fullName.substring(lastDot + 1) : fullName;
  const node = new NodeSchema(nm, '', ns);
  runtime.saveSchema(node);
}

export function registerScalarGenerators(runtime: SchemaRuntime): void {
  for (const kind of [SCHEMA_KIND_BOOL, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING, SCHEMA_KIND_DATE]) {
    runtime.registerSchemaKind(kind, { generator: generateScalarSchema });
  }
}

export { generateScalarSchema };
