// =============================================================================
// ScalarNode<T> — typed scalar value node
// Mirrors C# SchemaNode.Core/Node/ScalarNode.cs
// =============================================================================

import { LowLimitDate, LowLimitInt, LowLimitNumber, LowLimitString, UpLimitDate, UpLimitInt, UpLimitNumber, UpLimitString } from '../property';
import { isNull, parseDate } from '../utility/toolset';
import { DataNode } from './dataNode';

/** The data node represets the scalar types */
export abstract class ScalarNode extends DataNode {}

// ── Concrete scalar nodes ─────────────────────────────────────────────────

/** The data node represents the object type */
export class AnyNode extends ScalarNode {}

/** The data node represents the bool node */
export class BoolNode extends ScalarNode {
  override getValue() {
    let value = this._value;
    if (typeof (value) === "string") value = value.toLowerCase() === "true"
    if (!isNull(value)) value = value ? true : false
    return value;
  }
}

/** The data node represents the string node */
export class StringNode extends ScalarNode {
  override getValue() {
    let value = this._value;
    return `${value instanceof Date ? value.toISOString() : typeof (value) === "object" ? JSON.stringify(value) : value}`
  }

  /** The uplimit of string */
  get upLimit(): number | undefined { return this.getPropertyValue(UpLimitString) as number }

  /** The lowlimit of string */
  get lowLimit(): number | undefined { return this.getPropertyValue(LowLimitString) as number }
}

/** The int node represents the int node */
export class IntNode extends ScalarNode {
  override getValue() {
    let value = this._value;
    if (isNull(value)) return null;
    if (typeof value === 'string') value = parseInt(value);
    return Number.isFinite(value) ? value : null;
  }

  /** The uplimit of int */
  get upLimit(): number | undefined { return this.getPropertyValue(UpLimitInt) as number }

  /** The lowlimit of int */
  get lowLimit(): number | undefined { return this.getPropertyValue(LowLimitInt) as number }
}

export class DecimalNode extends ScalarNode {
  override getValue() {
    let value = this._value;
    if (isNull(value)) return null;
    if (typeof value === 'string') value = parseFloat(value);
    return Number.isFinite(value) ? value : null;
  }

  /** The uplimit of numeric */
  get upLimit(): number | undefined { return this.getPropertyValue(UpLimitNumber) as number }

  /** The lowlimit of numeric */
  get lowLimit(): number | undefined { return this.getPropertyValue(LowLimitNumber) as number }
}

export class DateNode extends ScalarNode {
  override getValue(){ return parseDate(this._value); }

  /** The uplimit of numeric */
  get upLimit(): Date | undefined { return parseDate(this.getPropertyValue(UpLimitDate)) }

  /** The lowlimit of numeric */
  get lowLimit(): Date | undefined { return parseDate(this.getPropertyValue(LowLimitDate)) }
}
