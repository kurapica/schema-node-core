// =============================================================================
// ScalarNode<T> — typed scalar value node
// Mirrors C# SchemaNode.Core/Node/ScalarNode.cs
// =============================================================================

import { isNull } from '../utility/toolset';
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
}

/** The int node represents the int node */
export class IntNode extends ScalarNode {
  override getValue() {
    let value = this._value;
    if (isNull(value)) return null;
    if (typeof value === 'string') value = parseInt(value);
    return Number.isFinite(value) ? value : null;
  }
}

export class NumericNode extends ScalarNode {
  override getValue() {
    let value = this._value;
    if (isNull(value)) return null;
    if (typeof value === 'string') value = parseFloat(value);
    return Number.isFinite(value) ? value : null;
  }
}

export class DateNode extends ScalarNode {
  override getValue(){
    let value = this._value;
    if (!(value instanceof Date)) {
        if (typeof (value) === "string" || typeof (value) === "number" && value > 0) {
            value = new Date(value)
            if (isNaN((value as Date)?.getFullYear())) value = null;
        }
        else {
            value = null;
        }
    }
    return value;
  }
}
