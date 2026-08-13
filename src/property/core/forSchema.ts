// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/ForSchema.cs
// =============================================================================

import { registerSchemaProperty } from '../../runtime/schemaRuntime';
import { isNull } from '../../utility/toolset';
import { Property } from '../property';

/**
 * Describes the schema kinds that this property is for. This is used to filter properties when generating code for a specific schema.
 */
export class ForSchema extends Property<string[]> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        if (!isNull(field) || !isNull(descriptorOrIndex)) return;
        target = typeof target === 'function' ? target : target.constructor;
        registerSchemaProperty(target as Function);
        (target as unknown as Record<string, string[]>).forSchema = this.getValue<string[]>()!;
    }
}

