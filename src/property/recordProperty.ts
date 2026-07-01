// =============================================================================
// RecordProperty<T> — property that auto-registers recorded values
// Mirrors C# SchemaNode.Core/Property/RecordProperty.cs
// =============================================================================

import { OrderProperty } from './orderProperty';
import type { IOrderProperty } from './orderProperty';

/**
 * Global registry for recorded property values.
 * Keyed by property constructor → (string value → order).
 * Mirrors C# ConcurrentDictionary<Type, ConcurrentDictionary<string, IOrderProperty>>.
 */
const _recordedValues = new Map<Function, Map<string, IOrderProperty>>();

/**
 * Base for properties whose values auto-register into a global record.
 * E.g., SchemaKind, NodeSchemaKind, RelationKind — each value records itself
 * so the runtime can enumerate all known kinds.
 */
export abstract class RecordProperty<T> extends OrderProperty<T> {
  override setValue<TValue>(value: TValue): void {
    super.setValue(value);
    this._record();
  }

  /** Register this property's string value → order in the global table. */
  private _record(): void {
    if (!this._hasValue || this._value === undefined) return;
    const ctor = this.constructor as Function;
    let map = _recordedValues.get(ctor);
    if (!map) {
      map = new Map();
      _recordedValues.set(ctor, map);
    }
    map.set(String(this._value), this);
  }
}

/**
 * Get all recorded values for a RecordProperty constructor,
 * sorted by order (ascending).
 */
export function getRecordedValues(propCtor: Function): IOrderProperty[] {
  const map = _recordedValues.get(propCtor);
  if (!map) return [];
  return [...map.values()].sort((a, b) => a.order - b.order);
}