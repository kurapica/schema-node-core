// =============================================================================
// ScalarNode<T> — typed scalar value node
// Mirrors C# SchemaNode.Core/Node/ScalarNode.cs
// =============================================================================

import { DataNode } from './dataNode';
import type { NodeSchema } from '../schema/nodeSchema';
import BigNumber from 'bignumber.js';

/**
 * Abstract scalar node holding a value of type T.
 */
export abstract class ScalarNode<T> extends DataNode {
  protected _value: T | undefined;

  get isEmpty(): boolean {
    return this._value === undefined || this._value === null;
  }

  trySetValue<TValue>(value: TValue): boolean {
    this._value = value as unknown as T;
    return true;
  }

  tryGetValue<TV>(): TV | undefined {
    return this._value as unknown as TV;
  }
}

// ── Concrete scalar nodes ─────────────────────────────────────────────────

export class AnyNode extends ScalarNode<unknown> {}
export class BoolNode extends ScalarNode<boolean> {}
export class StringNode extends ScalarNode<string> {}

export class IntNode extends ScalarNode<BigNumber> {
  override trySetValue<TValue>(value: TValue): boolean {
    if (value instanceof BigNumber) {
      this._value = value;
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
      this._value = new BigNumber(value);
    } else {
      return false;
    }
    return true;
  }
}

export class NumericNode extends ScalarNode<BigNumber> {
  override trySetValue<TValue>(value: TValue): boolean {
    if (value instanceof BigNumber) {
      this._value = value;
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
      this._value = new BigNumber(value);
    } else {
      return false;
    }
    return true;
  }
}

export class DateNode extends ScalarNode<Date> {
  override trySetValue<TValue>(value: TValue): boolean {
    if (value instanceof Date) {
      this._value = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      const d = new Date(value);
      if (isNaN(d.getTime())) return false;
      this._value = d;
    } else {
      return false;
    }
    return true;
  }
}
