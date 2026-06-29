// =============================================================================
// OfSchema — declares what schema kind a definition IS for (generator entry point)
// Values: "struct", "enum", "function", "property", etc.
// =============================================================================

import { Property } from '../property';

export class OfSchema extends Property<string[]> {
  override setValue<TValue>(value: TValue): void {
    if (typeof value === 'string') {
      super.setValue([value] as TValue);
    } else {
      super.setValue(value);
    }
  }
}
