// =============================================================================
// ArithmeticType — operation classification
// =============================================================================

export enum ArithmeticType {
  Add = 'add',
  Subtract = 'subtract',
  Divide = 'divide',
  Modulo = 'modulo',
  Multiply = 'multiply',
  Min = 'min',
  Max = 'max',
  BitUnary = 'bitunary',
  BitAnd = 'bitand',
  BitLeftShift = 'bitleftshift',
  BitOr = 'bitor',
  BitRightShift = 'bitrightshift',
  BitXor = 'bitxor',
  ToDecimal = 'todecimal',
  ToDouble = 'todouble',
  ToSingle = 'tosingle',
  ToInt = 'toint',
  Transform = 'transform',
}

export type ArithmeticTypeValue = `${ArithmeticType}`;
