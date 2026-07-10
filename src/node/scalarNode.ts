// =============================================================================
// ScalarNode<T> — typed scalar value node
// Mirrors C# SchemaNode.Core/Node/ScalarNode.cs
// =============================================================================

import { DataNode } from './dataNode';
import type { ValueType } from '../runtime/type/valueType';
import BigNumber from 'bignumber.js';

/**
 * Abstract scalar node holding a value of type T.
 */
export abstract class ScalarNode<T> extends DataNode {
  protected _value: T | undefined;

  constructor(type: ValueType) {
    super(type);
  }

  get isEmpty(): boolean {
    return this._value === undefined || this._value === null || this._value === '' || 
      (typeof this._value === 'object' && this._value && 'isZero' in (this._value as object) && (this._value as unknown as { isZero: () => boolean }).isZero?.() || false);
  }

  trySetValue<TValue>(value: TValue): boolean {
    this._value = value as unknown as T;
    return true;
  }

  tryGetValue<TV>(): TV | undefined {
    return this._value as unknown as TV;
  }

  clone(): DataNode {
    const Ctor = this.constructor as new (type: ValueType) => ScalarNode<T>;
    const copy = new Ctor(this.type);
    copy._value = this._value;
    return copy;
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
