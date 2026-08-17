// =============================================================================
// Mirrors C# SchemaNode.Core/Schema/NamespaceSchema.cs
// =============================================================================

import { Meta } from '../../attribute/meta';
import { SchemaKind } from '../../property/record/schemaKind';
import { NodeSchemaKind } from '../../property/record/nodeSchemaKind';
import { SchemaType } from '../../property/core/schemaType';
import { OfSchema } from '../../property/core/ofSchema';
import { Valid } from '../../property/constraint/valid';
import { RuntimeNodeType } from '../../property/core/runtimeNodeType';
import { Base } from '../../property/core/base';
import { buildFuncCall } from '../../schema/function/type';
import { NamespaceType } from './runtime';

import { SCHEMA_KIND_NAMESPACE, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_NODE_TYPE, NODE_SELF, NS_SYSTEM_SCHEMA_NAMESPACE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_ORDER_NAMESPACE } from '../../utility/constant';

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_NAMESPACE, SCHEMA_KIND_ORDER_NAMESPACE])
@Meta(NodeSchemaKind, [SCHEMA_KIND_NAMESPACE, SCHEMA_KIND_ORDER_NAMESPACE])
@Meta(RuntimeNodeType, NamespaceType)
class NamespaceSchemaMeta {}

/** Represents the namespace type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_NAMESPACE_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, false, SCHEMA_KIND_NAMESPACE))
class NamespaceTypeMeta {}