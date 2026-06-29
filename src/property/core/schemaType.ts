// =============================================================================
// SchemaType — declares the fully-qualified schema name
// e.g., "system.schema.enum.value", "system.math.add"
// =============================================================================

import { Property } from '../property';

export class SchemaType extends Property<string> {}
