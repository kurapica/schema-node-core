// =============================================================================
// IOrderProperty & OrderProperty<T> — ordered property values
// Mirrors C# SchemaNode.Core/Property/OrderProperty.cs
// =============================================================================

import { getMetaProperty } from '../attribute/meta';
import type { IProperty } from '../interface/valueAccess';
import { Default } from './common/default';
import { Property } from './property';

/**
 * Interface for properties that carry an ordering index.
 */
export interface IOrderProperty extends IProperty {
  /** The sort order (lower = earlier). */
  readonly order: number;
}

/**
 * Base for value-bearing properties that also have an order.
 * setValue() can accept [value, order] tuple.
 */
export abstract class OrderProperty<T> extends Property<T> implements IOrderProperty {
  private _order = 0;

  get order(): number { return this._order; }

  /** Accept [value, order] tuple or plain value. */
  override setValue<TValue>(value: TValue): void {
    if (Array.isArray(value) && value.length > 0) {
      if (value.length === 1 && typeof(value[0]) === 'number') {
        const defaultProp = getMetaProperty(this.constructor, Default);
        if (defaultProp)
          super.setValue(defaultProp.getValue());
        this._order = value[0];
        return;
      }

      super.setValue(value[0] as TValue);
      this._order = parseInt(value[1] || '0');
    } else {
      super.setValue(value);
    }
  }
}
