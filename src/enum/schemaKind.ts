// =============================================================================
// SchemaKind — dynamic Record-based enum (no hardcoded members)
// Values are registered via @Meta(SchemaKindRecord, "...") at runtime.
// Mirrors C# SchemaNode.Core/Enum/SchemaKind.cs
// =============================================================================

import { RecordProperty } from '../property/recordProperty';

/** Marker class — values dynamically collected from @Meta(SchemaKindRecord, "...") */
export class SchemaKindRecordMarker extends RecordProperty<string> {}

/** Runtime registry of schema kinds. Populated by the platform during startup. */
export const SchemaKind: Record<string, string> = {};
