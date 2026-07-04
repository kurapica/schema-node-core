// =============================================================================
// NamespaceSchema — extension data under "namespace" key
// =============================================================================

import { Meta } from '../attribute/meta';
import { SchemaKind, NodeSchemaKind, SchemaType, Attach, ForSchema, OfSchema } from '../property/index';
import { Property } from '../property/property';
import { NodeSchema } from './nodeSchema';
import { SCHEMA_KIND_NAMESPACE, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_NS, NS_SYSTEM_SCHEMA_PROPERTY_CORE } from '../utility/constant';

/** Pure data interface. */
export interface NamespaceSchema {
  schemas: NodeSchema[];
}

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_NAMESPACE, 1])
@Meta(NodeSchemaKind, [SCHEMA_KIND_NAMESPACE, 1])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_NS}.schema`)
@Meta(Attach, SCHEMA_KIND_NAMESPACE)
class NamespaceSchemaMeta implements NamespaceSchema {
  schemas: NodeSchema[] = [];
}

@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.namespace`)
export class NamespaceProperty extends Property<NamespaceSchema> {}
