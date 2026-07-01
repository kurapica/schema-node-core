// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/OfSchema.cs
// =============================================================================

import { Property } from '../property';

/**
 * Represents the schema kinds that a definition is associated with.
 */
export class OfSchema extends Property<string[]> {
  override setValue<TValue>(value: TValue): void {
    if (typeof value === 'string') {
      super.setValue([value] as TValue);
    } else {
      super.setValue(value);
    }
  }
}
