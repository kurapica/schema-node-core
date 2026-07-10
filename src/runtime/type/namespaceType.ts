// =============================================================================
// NamespaceType — runtime type for namespace schemas (schema tree nodes)
// Mirrors C# SchemaNode.Core/Runtime/Type/NamespaceType.cs
// =============================================================================

import { NodeType } from './nodeType';
import type { NodeSchema } from '../../schema/nodeSchema';

export class NamespaceType extends NodeType {
  /** Child types by name. */
  private _children = new Map<string, NodeType>();

  /** Child schemas by name (loaded/registered). */
  private _childSchemas = new Map<string, NodeSchema>();

  // ── NodeType management ────────────────────────────────────────────────

  saveNodeType(name: string, type: NodeType): void {
    this._children.set(name, type);
  }

  getNodeType(name: string): NodeType | undefined {
    return this._children.get(name);
  }

  get children(): ReadonlyMap<string, NodeType> {
    return this._children;
  }

  // ── NodeSchema management (for reload detection & provider merging) ─────

  /** Cache a NodeSchema keyed by name (used for reload detection). */
  saveNodeSchema(schema: NodeSchema): void {
    this._childSchemas.set(schema.name.toLowerCase(), schema);
  }

  /** Get a cached NodeSchema by name. */
  getChildNodeSchema(name: string): NodeSchema | undefined {
    return this._childSchemas.get(name.toLowerCase());
  }
}
