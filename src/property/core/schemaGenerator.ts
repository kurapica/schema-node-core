// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/SchemaGenerator.cs
// =============================================================================

import { Property } from '../property';

/**
 * Declare the shema generator for a node schema kind
 */
export class SchemaGenerator extends Property<Function> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        (target as unknown as Record<string, Function>).schemaGenerator = this.getValue<Function>()!;
    }
}
