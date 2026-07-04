// =============================================================================
// ObjectSchema — arbitrary JSON value container
// =============================================================================

import { Meta } from '../attribute/meta';
import { SchemaKind, NodeSchemaKind, ValueSchemaKind, SchemaType, Attach, ForSchema, OfSchema } from '../property/index';
import { Property } from '../property/property';
import { SCHEMA_KIND_OBJECT, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_OBJECT, NS_SYSTEM_SCHEMA_PROPERTY_CORE } from '../utility/constant';

/** Pure data interface — empty marker type for arbitrary JSON values. */
export interface ObjectSchema {}

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_OBJECT, 2])
@Meta(NodeSchemaKind, [SCHEMA_KIND_OBJECT, 2])
@Meta(ValueSchemaKind, [SCHEMA_KIND_OBJECT, 2])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_OBJECT}.schema`)
@Meta(Attach, SCHEMA_KIND_OBJECT)
class ObjectSchemaMeta implements ObjectSchema {}

@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.object`)
export class ObjectProperty extends Property<ObjectSchema> {}


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
