// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/Static.cs
// =============================================================================

import { Property } from '../property';

/**
 * Static property type — prevents relation modification of this property.
 * This is used to mark properties that should not be modified by relation system.
 */
export class Static extends Property<boolean> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        (target as unknown as Record<string, boolean>).static = this.getValue<boolean>() ?? false;
    }
}
