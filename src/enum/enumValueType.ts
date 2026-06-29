// =============================================================================
// EnumValueType — how enum values are stored
// =============================================================================

export enum EnumValueType {
  String = 'string',
  Int = 'int',
  Flags = 'flags',
}

export type EnumValueTypeValue = `${EnumValueType}`;
