// =============================================================================
// SchemaType — declares the fully-qualified schema name
// e.g., "system.schema.enum.value", "system.math.add"
// =============================================================================

import { registerSchemaType } from '../../runtime/schemaRuntime';
import { Property } from '../property';

export class SchemaType extends Property<string> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        if (!this.hasValue) throw new Error(`SchemaType property must have a value when applied to ${target.constructor.name}`);
        return registerSchemaType(typeof target === 'function' ? target : target.constructor, this.getValue<string>()!.toLowerCase());
    }
}
