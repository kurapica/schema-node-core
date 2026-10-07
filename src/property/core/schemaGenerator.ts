// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/SchemaGenerator.cs
// =============================================================================

import { Meta } from '../../attribute/meta';
import { Alias } from './alias';
import { isNull } from '../../utility/toolset';
import { Property } from '../property';

/**
 * Declare the shema generator for a node schema kind
 */
@Meta(Alias, 'schemaGenerator')
export class SchemaGenerator extends Property<Function> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        if (!isNull(field) || !isNull(descriptorOrIndex)) return;
        target = typeof target === 'function' ? target : target.constructor;
        (target as unknown as Record<string, Function>).schemaGenerator = this.getValue<Function>()!;
    }
}
