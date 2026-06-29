// =============================================================================
// LogicType — logic operation classification
// =============================================================================

export enum LogicType {
  AndAlso = 'andalso',
  OrElse = 'orelse',
  Not = 'not',
  IsNull = 'isnull',
  IsEmpty = 'isempty',
  NotNull = 'notnull',
  NotEmpty = 'notempty',
  Equal = 'equal',
  NotEqual = 'notequal',
  GreaterThan = 'greaterthan',
  GreaterEqual = 'greaterequal',
  LessThan = 'lessthan',
  LessEqual = 'lessequal',
  Contains = 'contains',
  NotContains = 'notcontains',
  StartsWith = 'startswith',
  NotStartsWith = 'notstartswith',
  EndsWith = 'endswith',
  NotEndsWith = 'notendswith',
  Match = 'match',
  NotMatch = 'notmatch',
}

export type LogicTypeValue = `${LogicType}`;
