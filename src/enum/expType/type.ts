// =============================================================================
// ExpType — expression operation types
// =============================================================================

export enum ExpType {
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

export type ExpTypeValue = `${ExpType}`;
