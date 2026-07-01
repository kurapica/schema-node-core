// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Core/ForSchema.cs
// =============================================================================

import { Property } from '../property';

/**
 * Describes the schema kinds that this property is for. This is used to filter properties when generating code for a specific schema.
 */
export class ForSchema extends Property<string[]> {}
