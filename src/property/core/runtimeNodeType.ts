// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/NodeType.cs
// =============================================================================

import { NodeType } from '../../schema/node/runtime';
import { Property } from '../property';

/**
 * Define the runtime type of a node schema kind.
 */
export class RuntimeNodeType extends Property<new () => NodeType> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        (target as unknown as Record<string, new () => NodeType>).runtimeNodeType = this.getValue<new () => NodeType>()!;
    }
}
