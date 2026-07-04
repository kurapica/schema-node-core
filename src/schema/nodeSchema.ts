// =============================================================================
// NodeSchema — the core schema container node
// Mirrors C# SchemaNode.Core/Schema/NodeSchema.cs
// =============================================================================

import { Meta } from '../attribute/meta';
import { SchemaLoadState } from '../enum/schemaLoadState';
import { SchemaKind, SchemaType, Attach, PrimaryIndex } from '../property/index';
import { SCHEMA_KIND_NODE, NS_SYSTEM_SCHEMA_NODE, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_NS } from '../utility/constant';

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

@Meta(SchemaKind, [SCHEMA_KIND_NODE, 0])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_NODE}.schema`)
@Meta(Attach, SCHEMA_KIND_NODE)
export class NodeSchemaMeta implements NodeSchema {
  @Meta(PrimaryIndex, 0)
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_NS}.type`)
  namespace?: string;

  @Meta(PrimaryIndex, 1)
  name: string = '';

  @Meta(SchemaType, NS_SYSTEM_STRING)
  kind: string = '';

  /** Sub-schemas — only for namespace schemas. */
  schemas?: NodeSchema[];

  /** Compatible type names for coercion. */
  compatibles?: CompatibleSchema[];

  /** Schemas that reference (use) this one. */
  usedBy?: string[];

  /** Load state tracking. */
  loadState?: SchemaLoadState;

  /** Full qualified name: namespace.name. */
  get fullName(): string {
    return this.namespace ? `${this.namespace}.${this.name}` : this.name;
  }
}
