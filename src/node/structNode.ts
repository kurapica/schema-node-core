// =============================================================================
// StructNode — structured data node with named fields
// Mirrors C# SchemaNode.Core/Node/StructNode.cs
// =============================================================================

import { DataNode } from './dataNode';
import type { ValueType } from '../runtime/type/valueType';
import type { StructType, StructFieldType } from '../runtime/type/structType';

export class StructNode extends DataNode {
  /** Field nodes, keyed by field name. */
  private _fields = new Map<string, DataNode>();

  constructor(type: ValueType) {
    super(type);
    // Initialize fields from the StructType's field definitions
    const structType = type as StructType;
    for (const fieldType of structType.getFields()) {
      if (fieldType.type) {
        this._fields.set(fieldType.name, fieldType.type.create());
      }
    }
  }

  get isEmpty(): boolean {
    return this._fields.size === 0;
  }

  trySetValue<T>(_value: T): boolean {
    return false; // StructNode value setting is done per-field
  }

  tryGetValue<T>(): T | undefined {
    const obj: Record<string, unknown> = {};
    for (const [key, node] of this._fields) {
      obj[key] = node.tryGetValue();
    }
    return obj as unknown as T;
  }

  clone(): DataNode {
    const copy = new StructNode(this.type);
    copy._fields = new Map();
    for (const [key, node] of this._fields) {
      copy._fields.set(key, node.clone());
    }
    return copy;
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
    if (first === '$previous') return undefined;

    const field = this._fields.get(first);
    if (!field) return undefined;
    return rest ? field.getAccessValue(rest) : field;
  }
}
