// =============================================================================
// Mirrors C# SchemaNode.Core/Schema/NodeSchema.cs
// =============================================================================

import { Relation } from '../attribute';
import { Meta } from '../attribute/meta';
import { SchemaLoadState } from '../enum/schemaLoadState';
import { Base } from '../property/core/base';
import { buildFuncCall } from '../property/funcCallProperty';
import { SchemaKind, SchemaType, Attach, PrimaryIndex, OfSchema, UpLimitString, EntrySource, Valid, Require, ReadOnly, Immutable } from '../property/index';
import { Call } from '../relation';
import { SCHEMA_KIND_NODE, NS_SYSTEM_SCHEMA_NODE, NS_SYSTEM_SCHEMA_NODE_TYPE, NS_SYSTEM_SCHEMA_NAMESPACE_TYPE, NS_SYSTEM_IDENTIFIER, NS_SYSTEM_SCHEMA_KIND, NS_SYSTEM_SCHEMA_ERROR, SCHEMA_KIND_STRING, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_REFLECT, NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_VALUE_KIND, PRIMARY_KEY_MAX_LEN, SCHEMA_KIND_ORDER_NODE, NS_SYSTEM_LOGIC } from '../utility/constant';
import { combinePaths } from '../utility/toolset';

/** The schema container node, which can contain other nodes, such as scalar, struct, enum, array, etc. */
export interface NodeSchema {
  /** The namespace which includes the schema */
  namespace?: string;

  /** The schema name */
  name: string;

  /** The schema kind */
  kind: string;

  /** Sub-schemas — only for namespace schemas. */
  schemas?: NodeSchema[];

  /** Compatible type names for coercion. */
  compatibles?: CompatibleSchema[];

  /** Schemas that reference (use) this one. */
  usedBy?: string[];

  /** Load state tracking. */
  loadState?: SchemaLoadState;

  /** The error status */
  error?: string;
}

/** A compatible type declaration (for type coercion). */
export interface CompatibleSchema {
  type: string;
}

/**
 * The meta definition of the node schema
 */
@Meta(SchemaKind, [SCHEMA_KIND_NODE, SCHEMA_KIND_ORDER_NODE])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_NODE}.schema`)
@Meta(Attach, SCHEMA_KIND_NODE)
class NodeSchemaMeta implements NodeSchema {
  @Meta(PrimaryIndex, 0)
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NAMESPACE_TYPE)
  @Relation(ReadOnly, Call, buildFuncCall(`${NS_SYSTEM_LOGIC}.{nameof(SystemLogic.notempty)}`, "@name"))
  namespace?: string;

  @Meta(PrimaryIndex, 1)
  @Meta(SchemaType, NS_SYSTEM_IDENTIFIER)
  @Meta(Require, true)
  @Meta(Immutable, true)
  name: string = '';

  @Meta(SchemaType, NS_SYSTEM_SCHEMA_KIND)
  @Meta(Require, true)
  kind: string = '';

  /** The error status */
  error?: string;

  /** Sub-schemas — only for namespace schemas. */
  schemas?: NodeSchema[];

  /** Compatible type names for coercion. */
  compatibles?: CompatibleSchema[];

  /** Schemas that reference (use) this one. */
  usedBy?: string[];

  /** Load state tracking. */
  loadState?: SchemaLoadState;
}

/** Represents the namespace type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
@Meta(Base, NS_SYSTEM_STRING)
@Meta(UpLimitString, PRIMARY_KEY_MAX_LEN)
@Meta(EntrySource, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT}.gettypes`, NODE_SELF))
class AnyTypeMeta {}

/** Represents the value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_VALUE_KIND, NODE_SELF))
class ValueTypeMeta {}

/** Gets the node schema full name */
export function getNodeSchemaName(nodeSchema: NodeSchema) {
  return combinePaths(nodeSchema.namespace ?? "", nodeSchema.name);
}