// =============================================================================
// NamespaceSchema — extension data under "namespace" key
// =============================================================================

import { Meta } from '../attribute/meta';
import { SchemaKindRecord, NodeSchemaKindRecord, SchemaType, Attach, ForSchema, OfSchema } from '../property/index';
import { Property } from '../property/property';
import { NodeSchema } from './nodeSchema';
import { SCHEMA_KIND_NAMESPACE, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_NS, NS_SYSTEM_SCHEMA_PROPERTY_CORE } from '../utility/constant';

@Meta(SchemaKindRecord, [SCHEMA_KIND_NAMESPACE, 1])
@Meta(NodeSchemaKindRecord, [SCHEMA_KIND_NAMESPACE, 1])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_NS}.schema`)
@Meta(Attach, SCHEMA_KIND_NAMESPACE)
export class NamespaceSchema {
  schemas: NodeSchema[] = [];
}

@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.namespace`)
export class NamespaceProperty extends Property<NamespaceSchema> {}
