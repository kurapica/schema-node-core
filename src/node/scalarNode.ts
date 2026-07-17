// =============================================================================
// ScalarNode<T> — typed scalar value node
// Mirrors C# SchemaNode.Core/Node/ScalarNode.cs
// =============================================================================

import { DataNode } from './dataNode';
import BigNumber from 'bignumber.js';

/**
 * Abstract scalar node holding a value of type T.
 */
export abstract class ScalarNode extends DataNode {}

// ── Concrete scalar nodes ─────────────────────────────────────────────────

export class AnyNode extends ScalarNode {}

export class BoolNode extends ScalarNode {}

export class StringNode extends ScalarNode {}

export class IntNode extends ScalarNode {
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

export class NumericNode extends ScalarNode {
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

export class DateNode extends ScalarNode {
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
