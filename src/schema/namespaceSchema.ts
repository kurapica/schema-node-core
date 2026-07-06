// =============================================================================
// Mirrors C# SchemaNode.Core/Schema/NamespaceSchema.cs
// =============================================================================

import { Meta } from '../attribute/meta';
import { SchemaKind, NodeSchemaKind, SchemaType, OfSchema, Valid } from '../property/index';
import { SCHEMA_KIND_NAMESPACE, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_NODE_TYPE, NODE_SELF, NS_SYSTEM_SCHEMA_NAMESPACE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_ORDER_NAMESPACE } from '../utility/constant';
import { RuntimeNodeType } from '../property/core/RuntimeNodeType';
import { NamespaceType } from '../runtime/type';
import { Base } from '../property/core/base';

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_NAMESPACE, SCHEMA_KIND_ORDER_NAMESPACE])
@Meta(NodeSchemaKind, [SCHEMA_KIND_NAMESPACE, SCHEMA_KIND_ORDER_NAMESPACE])
@Meta(RuntimeNodeType, NamespaceType)
class NamespaceSchemaMeta {}

/** Represents the namespace type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_NAMESPACE_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_TYPE)
@Meta(Valid, { func: NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, args: [ { source: NODE_SELF }, { value: SCHEMA_KIND_NAMESPACE }] } )
class NamespaceTypeMeta {}