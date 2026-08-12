// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/SchemaType.cs
// =============================================================================

import { registerSchemaType } from '../../runtime/schemaRuntime';
import { Property } from '../property';

/**
 * Represents a schema type property that can be applied to classes or class members. This property is used to register the schema type of a class or give schema type to a member in the schema runtime.
 */
export class SchemaType extends Property<string> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        registerSchemaType(this.getValue<string>()!.toLowerCase(), typeof target === 'function' ? target : target.constructor);
        (target as unknown as Record<string, string>).schemaType = this.getValue<string>()!;
    }
}
