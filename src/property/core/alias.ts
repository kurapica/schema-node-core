// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/Alias.cs
// =============================================================================

import { isNull } from '../../utility/toolset';
import { Property } from '../property';

/**
 * Declare an alternate property name for schema serialization.
 * Mirrors C# SchemaNode.Core/Property/Core/Alias.cs
 */
export class Alias extends Property<string> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        if (!isNull(field) || !isNull(descriptorOrIndex)) return;
        target = typeof target === 'function' ? target : target.constructor;
        (target as unknown as Record<string, string>).alias = this.getValue<string>()!;
    }
}
