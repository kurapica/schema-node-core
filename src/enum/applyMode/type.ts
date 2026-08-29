// =============================================================================
// ApplyMode — apply mode
// =============================================================================

export enum ApplyMode {
  Call = 'call',
  Map = 'map',
  Reduce = 'reduce',
  First = 'first',
  Last = 'last',
  Filter = 'filter',
  Count = 'count',
  All = 'all',
  Any = 'any',
}

export type ApplyModeValue = `${ApplyMode}`;
