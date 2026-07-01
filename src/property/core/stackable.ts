// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/Stackable.cs
// =============================================================================

import { Property } from '../property';

/**
 * Declare whether duplicate properties from different sources stack (accumulate) vs override.
 * Mirrors C# SchemaNode.Core/Property/Core/Stackable.cs
 */
export class Stackable extends Property<boolean> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        (target as unknown as Record<string, boolean>).stackable = true;
    }
}
