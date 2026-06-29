// =============================================================================
// IOrderProperty & OrderProperty<T> — ordered property values
// Mirrors C# SchemaNode.Core/Property/OrderProperty.cs
// =============================================================================

import { Property } from './property';
import type { IProperty } from './property';

/**
 * Interface for properties that carry an ordering index.
 */
export interface IOrderProperty extends IProperty {
  /** The sort order (lower = earlier). */
  order: number;

  /** Set the order value. */
  setOrder(order: number): void;
}

/**
 * Base for value-bearing properties that also have an order.
 * setValue() can accept [value, order] tuple.
 */
export abstract class OrderProperty<T> extends Property<T> implements IOrderProperty {
  private _order = 0;

  get order(): number {
    return this._order;
  }

  setOrder(order: number): void {
    this._order = order;
  }

  /** Accept [value, order] tuple or plain value. */
  override setValue<TValue>(value: TValue): void {
    if (Array.isArray(value) && value.length === 2 && typeof value[1] === 'number') {
      const v = value as unknown as [unknown, number];
      super.setValue(v[0] as TValue);
      this._order = v[1];
    } else {
      super.setValue(value);
    }
  }
}
