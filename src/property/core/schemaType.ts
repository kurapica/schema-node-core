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
        if (!this.hasValue) throw new Error(`SchemaType property must have a value when applied to ${target.constructor.name}`);
        return registerSchemaType(typeof target === 'function' ? target : target.constructor, this.getValue<string>()!.toLowerCase());
    }
}
