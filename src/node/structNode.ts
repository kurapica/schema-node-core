// =============================================================================
// StructNode — structured data node with named fields
// Mirrors C# SchemaNode.Core/Node/StructNode.cs
// =============================================================================

import { DataNode } from './dataNode';
import type { NodeSchema } from '../schema/nodeSchema';
import type { StructSchema } from '../schema/structSchema';

export class StructNode extends DataNode {
  /** Field nodes, keyed by field name. */
  private _fields = new Map<string, DataNode>();

  get isEmpty(): boolean {
    return this._fields.size === 0;
  }

  trySetValue<T>(_value: T): boolean {
    // StructNode value setting is done per-field
    return false;
  }

  tryGetValue<T>(): T | undefined {
    // Return the struct as a plain object
    const obj: Record<string, unknown> = {};
    for (const [key, node] of this._fields) {
      obj[key] = node.tryGetValue();
    }
    return obj as unknown as T;
  }

  /** Get a field node by name. */
  getField(name: string): DataNode | undefined {
    return this._fields.get(name);
  }

  /** Set a field node. */
  setField(name: string, node: DataNode): void {
    this._fields.set(name, node);
  }

  /** All field names. */
  get fieldNames(): string[] {
    return [...this._fields.keys()];
  }

  /** All field nodes. */
  get fields(): DataNode[] {
    return [...this._fields.values()];
  }

  override getAccessValue(path: string): DataNode | undefined {
    const dot = path.indexOf('.');
    const first = dot >= 0 ? path.substring(0, dot) : path;
    const rest = dot >= 0 ? path.substring(dot + 1) : '';

    if (first === '$self') return this;
    if (first === '$previous') return undefined; // struct has no previous

    const field = this._fields.get(first);
    if (!field) return undefined;
    return rest ? field.getAccessValue(rest) : field;
  }

  /** Build child DataNodes from the StructSchema field definitions. */
  buildFields(schema: StructSchema): void {
    for (const fieldDef of schema.fields) {
      const childSchema = this._resolveFieldSchema(fieldDef.type);
      if (!childSchema) continue;

      const childNode = this._createNodeForSchema(childSchema, fieldDef.extensions);
      this._fields.set(fieldDef.name, childNode);
    }
  }

  private _resolveFieldSchema(_typeName: string): NodeSchema | undefined {
    // Will be connected to SchemaRuntime for type resolution
    return undefined;
  }

  private _createNodeForSchema(_schema: NodeSchema, _overrides?: Record<string, unknown>): DataNode {
    // Factory: create the appropriate DataNode subclass
    // Will be connected to NodeType registry
    return undefined as unknown as DataNode;
  }
}
