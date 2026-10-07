// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/ofNodeKind.cs
// =============================================================================

import { Meta } from '../../attribute/meta';
import { Alias } from './alias';
import { isNull } from '../../utility/toolset';
import { Property } from '../property';

/** Represents the schema kind that a definition is associated with. */
@Meta(Alias, 'ofNodeKind')
export class OfNodeKind extends Property<string> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        if (!isNull(field) || !isNull(descriptorOrIndex)) return;
        target = typeof target === 'function' ? target : target.constructor;
        (target as unknown as Record<string, string>).ofNodeKind = this.getValue<string>()!;
    }
}
