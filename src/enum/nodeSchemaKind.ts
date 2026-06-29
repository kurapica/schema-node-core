// =============================================================================
// NodeSchemaKind — dynamic Record-based enum (no hardcoded members)
// Mirrors C# SchemaNode.Core/Enum/NodeSchemaKind.cs
// =============================================================================

import { RecordProperty } from '../property/recordProperty';

/** Marker class — values dynamically collected from @Meta(NodeSchemaKindRecord, "...") */
export class NodeSchemaKindRecordMarker extends RecordProperty<string> {}

/** Runtime registry of node schema kinds. */
export const NodeSchemaKind: Record<string, string> = {};
