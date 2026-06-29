import { NodeSchema } from '../schema/nodeSchema';
import { PropertySchema } from '../schema/propertySchema';
import type { SchemaRuntime } from '../runtime/schemaRuntime';
import { getMetaProperty } from '../attribute/meta';
import { SchemaType, ForSchema } from '../property/index';
import type { IProperty } from '../property/property';
import { SCHEMA_KIND_PROPERTY } from '../utility/constant';

export function generatePropertySchema(target: object, runtime: SchemaRuntime): void {
  const schemaTypeProp = getMetaProperty(target as Function, SchemaType);
  if (!schemaTypeProp?.hasValue) return;
  const fullName = schemaTypeProp.getValue<string>()!;
  const lastDot = fullName.lastIndexOf('.');
  const ns = lastDot >= 0 ? fullName.substring(0, lastDot) : '';
  const nm = lastDot >= 0 ? fullName.substring(lastDot + 1) : fullName;
  const propData = new PropertySchema();
  const temp = new (target as new () => IProperty)();
  propData.property = temp.name;
  const forSchemaProp = getMetaProperty(target as Function, ForSchema);
  if (forSchemaProp?.hasValue) propData.forSchemas = forSchemaProp.getValue<string[]>();
  const proto = (target as { prototype?: Record<string, unknown> }).prototype;
  if (proto) {
    propData.constraint = typeof proto.validate === 'function';
    propData.typeref = typeof (proto as Record<string, unknown>).getRefTypes === 'function';
  }
  const node = new NodeSchema(nm, SCHEMA_KIND_PROPERTY, ns);
  node.extensions = { property: propData };
  runtime.saveSchema(node);
}

export function registerPropertyGenerator(runtime: SchemaRuntime): void {
  runtime.registerSchemaKind(SCHEMA_KIND_PROPERTY, { generator: generatePropertySchema });
}
