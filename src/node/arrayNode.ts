// =============================================================================
// ArrayNode — ordered collection of DataNodes
// Mirrors C# SchemaNode.Core/Node/ArrayNode.cs
// =============================================================================

import { DataNode } from './dataNode';
import type { NodeSchema } from '../schema/nodeSchema';

export class ArrayNode extends DataNode implements Iterable<DataNode> {
  private _elements: DataNode[] = [];

  get isEmpty(): boolean {
    return this._elements.length === 0;
  }

  trySetValue<T>(value: T): boolean {
    if (Array.isArray(value)) {
      this._elements = value as unknown as DataNode[];
      return true;
    }
    return false;
  }

  tryGetValue<T>(): T | undefined {
    return this._elements.map((e) => e.tryGetValue()) as unknown as T;
  }

  /** Get elements. */
  get elements(): DataNode[] {
    return this._elements;
  }

  /** Number of elements. */
  get length(): number {
    return this._elements.length;
  }

  /** Get element by index. */
  at(index: number): DataNode | undefined {
    return this._elements[index];
  }

  /** Add an element. */
  push(node: DataNode): void {
    this._elements.push(node);
  }

  /** Remove last element. */
  pop(): DataNode | undefined {
    return this._elements.pop();
  }

  override getAccessValue(path: string): DataNode | undefined {
    if (path === '$self') return this;
    if (path === '$element') return this._elements[this._elements.length - 1];

    const dot = path.indexOf('.');
    const first = dot >= 0 ? path.substring(0, dot) : path;
    const rest = dot >= 0 ? path.substring(dot + 1) : '';

    const idx = parseInt(first, 10);
    if (!isNaN(idx)) {
      const elem = this._elements[idx];
      return rest && elem ? elem.getAccessValue(rest) : elem;
    }
    return undefined;
  }

  [Symbol.iterator](): Iterator<DataNode> {
    return this._elements[Symbol.iterator]();
  }

  forEach(callback: (node: DataNode, index: number) => void): void {
    this._elements.forEach(callback);
  }
}
