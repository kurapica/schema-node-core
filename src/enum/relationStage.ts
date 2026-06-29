// =============================================================================
// RelationStage — flags enum (bitmask), keep numeric
// =============================================================================

export enum RelationStage {
  Load = 1,
  Input = 2,
  Persist = 4,
  LoadInput = 3,
  LoadPersist = 5,
  InputPersist = 6,
  All = 7,
}
