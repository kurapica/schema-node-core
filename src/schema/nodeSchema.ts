// =============================================================================
// NodeSchema — the core schema container node
// Mirrors C# SchemaNode.Core/Schema/NodeSchema.cs
// =============================================================================

import { Meta } from '../attribute/meta';
import { SchemaKind, NodeSchemaKind, SchemaType, Attach, PrimaryIndex } from '../property/index';
import { ExtensibleSchema } from './extensibleSchema';
import { SCHEMA_KIND_NODE, NS_SYSTEM_SCHEMA_NODE } from '../utility/constant';

/** Load state flags for tracking schema sources. */
export enum SchemaLoadState {
  None = 0,
  Server = 1,
  Custom = 2,
  Frontend = 4,
  System = 8,
  Remote = 16,
}

/** A compatible type declaration (for type coercion). */
export interface CompatibleSchema {
  type: string;
}

@Meta(SchemaKind, [SCHEMA_KIND_NODE, 0])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_NODE}.schema`)
@Meta(Attach, SCHEMA_KIND_NODE)
export class NodeSchema extends ExtensibleSchema {
  @Meta(PrimaryIndex, 0)
  namespace?: string;

  @Meta(PrimaryIndex, 1)
  name: string = '';

  @Meta(SchemaType, 'system.string')
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

  constructor(name?: string, kind?: string, namespace?: string) {
    super();
    this.name = name ?? '';
    this.kind = kind ?? '';
    this.namespace = namespace;
  }
}
