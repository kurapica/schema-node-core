// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/Append.cs
// =============================================================================

import { isNull } from "../../utility/toolset";
import { Property } from "../property";

import type { PropertyCtor } from "../../interface";
import { registerSchemaProperty } from "../../runtime";

/**
 * Append property type — used to register additional property types for a schema kind.
 * When a property class has @Meta(Append, kind), it is added to the schema kind's property list.
 * This allows extending schema kinds with pre-defined property types without modifying the property class.
 * @example @Meta(Append, [Relations])
 */
export class Append extends Property<PropertyCtor[]> {
    apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
        if (!isNull(field) || !isNull(descriptorOrIndex)) return;
        target = typeof target === 'function' ? target : target.constructor;
        const props = this.getValue<PropertyCtor[]>();
        props?.forEach(registerSchemaProperty);
        (target as unknown as Record<string, PropertyCtor[]>).append = props!;
    }
}
