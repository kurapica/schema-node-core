// =============================================================================
// NamespaceType — runtime type for namespace schemas (schema tree nodes)
// Mirrors C# SchemaNode.Core/Runtime/Type/NamespaceType.cs
// =============================================================================

import { NodeType } from './nodeType';
import type { NodeSchema } from '../../schema/nodeSchema';
import { SchemaLoadState } from '../../enum/schemaLoadState';
import { SCHEMA_KIND_NAMESPACE } from '../../utility';

export class NamespaceType extends NodeType {
  /** Sub types by name. */
  private _subTypes = new Map<string, NodeType>();

  /** Sub schemas by name (loaded/registered). */
  private _subSchemas = new Map<string, NodeSchema>();

  // ── NodeType management ────────────────────────────────────────────────

  /** Save the node type */
  saveNodeType(name: string, type: NodeType): void {
    this._subTypes.set(name, type);
  }

  /** Gets the node type */
  getNodeType(name: string): NodeType | undefined {
    return this._subTypes.get(name);
  }

  /** Gets all sub node types */
  get children(): ReadonlyMap<string, NodeType> {
    return this._subTypes;
  }

  // ── NodeSchema management (for reload detection & provider merging) ─────

  /** Cache a NodeSchema keyed by name (used for reload detection). */
  saveSubNodeSchema(schema: NodeSchema | NodeSchema[]): void {
    if (Array.isArray(schema)) {
      schema.forEach((s) => this.saveSubNodeSchema(s));
      return;
    }

    // Ignore the schema if the namespace is not the same
    if (this.name.toLowerCase() != (schema.namespace ?? '').toLowerCase()) return;

    const name = schema.name.toLowerCase();
    const schemas = schema.schemas;
    delete schema.schemas;

    // The system schema don't need reload
    if (!(this._subSchemas.has(name) && schema.loadState === SchemaLoadState.System)) {
      this._subSchemas.set(name, schema);

      // mark the type need reload
      const type = this._subTypes.get(name);
      if (type) type.loaded = false;
    }

    // Create sub namespace types to save the schemas
    if (schemas?.length && schema.kind == SCHEMA_KIND_NAMESPACE)
    {
      let type = this._subTypes.get(name);
      if (!type) {
        type = new NamespaceType();
        type.namespace = this;
        type.loadType(schema).then(() => type!.loaded = false);
      }
      (type as NamespaceType).saveSubNodeSchema(schemas);
    }
  }

  /** Remove a sub node schema */
  removeSubNodeSchema(name: string): void {
    name = name.toLowerCase();
    this._subSchemas.delete(name);
    this._subTypes.delete(name);
  }

  /** Get a cached NodeSchema by name. */
  getSubNodeSchema(name: string): NodeSchema | undefined {
    return this._subSchemas.get(name.toLowerCase());
  }

  /** Whether the namespace type is used */
  get isUsed(): boolean {
    return this._subSchemas?.size > 0
  }
}
