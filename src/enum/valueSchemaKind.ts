// =============================================================================
// ValueSchemaKind — dynamic Record-based enum (no hardcoded members)
// Mirrors C# SchemaNode.Core/Enum/ValueSchemaKind.cs
// =============================================================================

import { RecordProperty } from '../property/recordProperty';

/** Marker class — values dynamically collected from @Meta(ValueSchemaKindRecord, "...") */
export class ValueSchemaKindRecordMarker extends RecordProperty<string> {}

/** Runtime registry of value schema kinds. */
export const ValueSchemaKind: Record<string, string> = {};
