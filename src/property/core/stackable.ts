// =============================================================================
// Stackable — whether duplicate properties from different sources stack
// Default: false (override). Set to true for constraint stacking (e.g., Valid).
// =============================================================================

import { Property } from '../property';

/**
 * Declare whether duplicate properties from different sources stack (accumulate) vs override.
 * Mirrors C# SchemaNode.Core/Property/Core/Stackable.cs
 */
export class Stackable extends Property<boolean> {
    apply(target: object, field?: string | symbol): void {
        if (this.hasValue)
            (target as unknown as Record<string, boolean>).stackable = this.getValue<boolean>()!;
    }
}
