// =============================================================================
// SchemaLoadState — flags enum (bitmask), keep numeric
// =============================================================================

/** The schema load state */
export enum SchemaLoadState {
  None = 0,
  System = 1,
  Service = 2,
  FrontEnd = 16,
}
