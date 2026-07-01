// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/Append.cs
// =============================================================================

import { IProperty, Property } from '../property';

/**
 * Append property type — used to register additional property types for a schema kind.
 * When a property class has @Meta(Append, kind), it is added to the schema kind's property list.
 * This allows extending schema kinds with pre-defined property types without modifying the property class.
 * @example @Meta(Append, [Relations])
 */
export class Append extends Property<(() => IProperty)[]> {}
