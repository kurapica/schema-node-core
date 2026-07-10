// =============================================================================
// system.math — arithmetic, numeric, constants, conversion, bitwise, trigonometry
// Mirrors C# SchemaNode.Core/Function/SystemMath.cs
// =============================================================================

import BigNumber from 'bignumber.js';
import { Meta } from '../attribute/meta';
import { OfSchema, SchemaType, Return, Generics, ArgName, Variadic } from '../property/index';
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_NUMBER, NS_SYSTEM_FLOAT, NS_SYSTEM_INT, NS_SYSTEM_MATH } from '../utility/constant';

function toBN(v: unknown): BigNumber { return v instanceof BigNumber ? v : new BigNumber(v as BigNumber.Value); }

// ── Main class ─────────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_MATH)
export class SystemMath {
  /** a + b + c + ... */
  @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: [NS_SYSTEM_NUMBER] }])
  static add(@Meta(ArgName, 'values') @Meta(SchemaType, 'T') @Meta(Variadic, true) ...values: number[]): number {
    return values.reduce((acc, v) => toBN(acc).plus(toBN(v)), new BigNumber(0)).toNumber();
  }

  /** a - b - c - ... */
  @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: [NS_SYSTEM_NUMBER] }])
  static subtract(@Meta(ArgName, 'values') @Meta(SchemaType, 'T') @Meta(Variadic, true) ...values: number[]): number {
    return values.reduce((acc, v) => toBN(acc).minus(toBN(v)), new BigNumber(0)).toNumber();
  }

  /** a * b * c * ... */
  @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: [NS_SYSTEM_NUMBER] }])
  static multiply(@Meta(ArgName, 'values') @Meta(SchemaType, 'T') ...values: number[]): number {
    return values.reduce((acc, v) => toBN(acc).times(toBN(v)), new BigNumber(1)).toNumber();
  }

  /** a / b / c */
  @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: [NS_SYSTEM_NUMBER] }])
  static divide(@Meta(ArgName, 'values') @Meta(SchemaType, 'T') @Meta(Variadic, true) ...values: number[]): number {
    if (values.length < 1) return 0;
    return values.slice(1).reduce((acc, v) => toBN(acc).div(toBN(v)), toBN(values[0])).toNumber();
  }

  /** a % b */
  @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: [NS_SYSTEM_NUMBER] }])
  static modulo(@Meta(ArgName, 'x') @Meta(SchemaType, 'T') x: number, @Meta(ArgName, 'y') @Meta(SchemaType, 'T') y: number): number {
    if (toBN(y).isZero()) return 0;
    return toBN(x).mod(toBN(y)).toNumber();
  }
}

// ── Constants ──────────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, `${NS_SYSTEM_MATH}.const`)
export class SystemMathConstants {
  @Meta(Return, NS_SYSTEM_NUMBER)
  static e(): number { return Math.E; }

  @Meta(Return, NS_SYSTEM_NUMBER)
  static pi(): number { return Math.PI; }
}

// ── Numeric ────────────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, `${NS_SYSTEM_MATH}.numeric`)
export class SystemMathNumeric {
  @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: [NS_SYSTEM_NUMBER] }])
  static abs(@Meta(ArgName, 'x') @Meta(SchemaType, 'T') x: number): number { return toBN(x).abs().toNumber(); }

  @Meta(Return, NS_SYSTEM_INT)
  static ceiling(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.ceil(toBN(x).toNumber()); }

  @Meta(Return, NS_SYSTEM_INT)
  static floor(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.floor(toBN(x).toNumber()); }

  @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: [NS_SYSTEM_NUMBER] }])
  static clamp<T>(
    @Meta(ArgName, 'x') @Meta(SchemaType, 'T') x: number,
    @Meta(ArgName, 'min') @Meta(SchemaType, 'T') min: number,
    @Meta(ArgName, 'max') @Meta(SchemaType, 'T') max: number,
  ): number { return BigNumber.max(toBN(min), BigNumber.min(toBN(x), toBN(max))).toNumber(); }

  @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: [NS_SYSTEM_NUMBER] }])
  static max(@Meta(ArgName, 'values') @Meta(SchemaType, 'T') ...values: number[]): number {
    if (values.length === 0) return 0;
    return BigNumber.max(...values.map(toBN)).toNumber();
  }

  @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: [NS_SYSTEM_NUMBER] }])
  static min(@Meta(ArgName, 'values') @Meta(SchemaType, 'T') ...values: number[]): number {
    if (values.length === 0) return 0;
    return BigNumber.min(...values.map(toBN)).toNumber();
  }

  @Meta(Return, NS_SYSTEM_NUMBER)
  static percent(
    @Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number,
    @Meta(ArgName, 'y') @Meta(SchemaType, NS_SYSTEM_NUMBER) y: number,
    @Meta(ArgName, 'decimals') @Meta(SchemaType, NS_SYSTEM_INT) decimals?: number,
  ): number {
    const pct = toBN(y).isZero() ? 0 : toBN(x).div(toBN(y)).times(100).toNumber();
    return decimals !== undefined ? +pct.toFixed(decimals) : pct;
  }

  @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: [NS_SYSTEM_NUMBER] }])
  static round<T>(
    @Meta(ArgName, 'x') @Meta(SchemaType, 'T') x: number,
    @Meta(ArgName, 'decimals') @Meta(SchemaType, NS_SYSTEM_INT) decimals?: number,
  ): number { return +toBN(x).toFixed(decimals ?? 0); }

  @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: [NS_SYSTEM_NUMBER] }])
  static ptnum<T>(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_FLOAT) x: number): number { return new BigNumber(x).div(100).toNumber(); }

  @Meta(Return, NS_SYSTEM_NUMBER)
  static exp(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.exp(toBN(x).toNumber()); }

  @Meta(Return, NS_SYSTEM_NUMBER)
  static log(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.log(toBN(x).toNumber()); }

  @Meta(Return, NS_SYSTEM_NUMBER)
  static sqrt(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return toBN(x).sqrt().toNumber(); }

  @Meta(Return, NS_SYSTEM_NUMBER)
  static cbrt(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.cbrt(toBN(x).toNumber()); }

  @Meta(Return, NS_SYSTEM_NUMBER)
  static log10(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.log10(toBN(x).toNumber()); }

  @Meta(Return, NS_SYSTEM_NUMBER)
  static log2(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.log2(toBN(x).toNumber()); }

  @Meta(Return, NS_SYSTEM_NUMBER)
  static pow(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number, @Meta(ArgName, 'y') @Meta(SchemaType, NS_SYSTEM_NUMBER) y: number): number {
    return Math.pow(toBN(x).toNumber(), toBN(y).toNumber());
  }
}

// ── Conversion ─────────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, `${NS_SYSTEM_MATH}.conversion`)
export class SystemMathConversion {
  @Meta(Return, NS_SYSTEM_NUMBER)
  static todecimal<T>(@Meta(ArgName, 'x') @Meta(SchemaType, 'T') x: number): number { return toBN(x).toNumber(); }

  @Meta(Return, NS_SYSTEM_NUMBER)
  static todouble<T>(@Meta(ArgName, 'x') @Meta(SchemaType, 'T') x: number): number { return toBN(x).toNumber(); }

  @Meta(Return, NS_SYSTEM_INT)
  static tointeger<T>(@Meta(ArgName, 'x') @Meta(SchemaType, 'T') x: number): number { return toBN(x).integerValue().toNumber(); }

  @Meta(Return, NS_SYSTEM_FLOAT)
  static tosingle<T>(@Meta(ArgName, 'x') @Meta(SchemaType, 'T') x: number): number { return toBN(x).toNumber(); }
}

// ── Bitwise ────────────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, `${NS_SYSTEM_MATH}.bitwise`)
export class SystemMathBitwise {
  @Meta(Return, NS_SYSTEM_INT)
  static bitand(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_INT) x: number, @Meta(ArgName, 'y') @Meta(SchemaType, NS_SYSTEM_INT) y: number): number { return x & y; }

  @Meta(Return, NS_SYSTEM_INT)
  static bitor(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_INT) x: number, @Meta(ArgName, 'y') @Meta(SchemaType, NS_SYSTEM_INT) y: number): number { return x | y; }

  @Meta(Return, NS_SYSTEM_INT)
  static bitxor(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_INT) x: number, @Meta(ArgName, 'y') @Meta(SchemaType, NS_SYSTEM_INT) y: number): number { return x ^ y; }

  @Meta(Return, NS_SYSTEM_INT)
  static bitunary(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_INT) x: number): number { return ~x; }

  @Meta(Return, NS_SYSTEM_INT)
  static bitleftshift(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_INT) x: number, @Meta(ArgName, 'shift') @Meta(SchemaType, NS_SYSTEM_INT) shift: number): number { return x << shift; }

  @Meta(Return, NS_SYSTEM_INT)
  static bitrightshift(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_INT) x: number, @Meta(ArgName, 'shift') @Meta(SchemaType, NS_SYSTEM_INT) shift: number): number { return x >> shift; }
}

// ── Trigonometry ───────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, `${NS_SYSTEM_MATH}.trigonometry`)
export class SystemMathTrigonometry {
  
  @Meta(Return, NS_SYSTEM_NUMBER)
  static acos(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.acos(x); }
  
  @Meta(Return, NS_SYSTEM_NUMBER)
  static asin(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.asin(x); }
  
  @Meta(Return, NS_SYSTEM_NUMBER)
  static atan(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.atan(x); }
  
  @Meta(Return, NS_SYSTEM_NUMBER)
  static cos(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.cos(x); }
  
  @Meta(Return, NS_SYSTEM_NUMBER)
  static sin(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.sin(x); }
  
  @Meta(Return, NS_SYSTEM_NUMBER)
  static tan(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.tan(x); }
  
  @Meta(Return, NS_SYSTEM_NUMBER)
  static acosh(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.acosh(x); }
  
  @Meta(Return, NS_SYSTEM_NUMBER)
  static asinh(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.asinh(x); }
  
  @Meta(Return, NS_SYSTEM_NUMBER)
  static atanh(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.atanh(x); }
  
  @Meta(Return, NS_SYSTEM_NUMBER)
  static cosh(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.cosh(x); }
  
  @Meta(Return, NS_SYSTEM_NUMBER)
  static sinh(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.sinh(x); }
  
  @Meta(Return, NS_SYSTEM_NUMBER)
  static tanh(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.tanh(x); }
}
