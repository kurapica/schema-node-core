// =============================================================================
// Alias — alternate property name used in schema serialization
// =============================================================================

import { Property } from '../property';

/**
 * Declare an alternate property name for schema serialization.
 * Mirrors C# SchemaNode.Core/Property/Core/Alias.cs
 */
export class Alias extends Property<string> {}
