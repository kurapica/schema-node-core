// =============================================================================
// system.math — arithmetic, numeric, constants, conversion, bitwise, trigonometry
// Mirrors C# SchemaNode.Core/Function/SystemMath.cs
// =============================================================================

import BigNumber from 'bignumber.js';
import { Meta } from '../attribute/meta';
import { OfSchema, SchemaType, Return, Generics, ArgName, Arithmetic, Constant } from '../property/index';
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_NUMBER, NS_SYSTEM_FLOAT, NS_SYSTEM_INT, NS_SYSTEM_STRING } from '../utility/constant';

function toBN(v: unknown): BigNumber { return v instanceof BigNumber ? v : new BigNumber(v as BigNumber.Value); }

// ── Main class ─────────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, 'system.math')
export class SystemMath {
  @Meta(SchemaType, 'system.math.add') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: ['system.number'] }])
  static add(@Meta(ArgName, 'values') @Meta(SchemaType, 'T') ...values: BigNumber[]): BigNumber {
    return values.reduce((acc, v) => toBN(acc).plus(toBN(v)), new BigNumber(0)) as unknown as BigNumber;
  }

  @Meta(SchemaType, 'system.math.subtract') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: ['system.number'] }])
  static subtract(@Meta(ArgName, 'x') @Meta(SchemaType, 'T') x: BigNumber, @Meta(ArgName, 'y') @Meta(SchemaType, 'T') y: BigNumber): BigNumber {
    return toBN(x).minus(toBN(y));
  }

  @Meta(SchemaType, 'system.math.multiply') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: ['system.number'] }])
  static multiply(@Meta(ArgName, 'values') @Meta(SchemaType, 'T') ...values: BigNumber[]): BigNumber {
    return values.reduce((acc, v) => toBN(acc).times(toBN(v)), new BigNumber(1)) as unknown as BigNumber;
  }

  @Meta(SchemaType, 'system.math.divide') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: ['system.number'] }])
  static divide(@Meta(ArgName, 'x') @Meta(SchemaType, 'T') x: BigNumber, @Meta(ArgName, 'y') @Meta(SchemaType, 'T') y: BigNumber): BigNumber {
    if (toBN(y).isZero()) return new BigNumber(0);
    return toBN(x).div(toBN(y));
  }

  @Meta(SchemaType, 'system.math.modulo') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: ['system.number'] }])
  static modulo(@Meta(ArgName, 'x') @Meta(SchemaType, 'T') x: BigNumber, @Meta(ArgName, 'y') @Meta(SchemaType, 'T') y: BigNumber): BigNumber {
    if (toBN(y).isZero()) return new BigNumber(0);
    return toBN(x).mod(toBN(y));
  }
}

// ── Constants ──────────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, 'system.math.const')
export class SystemMathConstants {
  @Meta(SchemaType, 'system.math.const.e') @Meta(Return, NS_SYSTEM_NUMBER)
  static e(): BigNumber { return new BigNumber(Math.E); }

  @Meta(SchemaType, 'system.math.const.pi') @Meta(Return, NS_SYSTEM_NUMBER)
  static pi(): BigNumber { return new BigNumber(Math.PI); }
}

// ── Numeric ────────────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, 'system.math.numeric')
export class SystemMathNumeric {
  @Meta(SchemaType, 'system.math.numeric.abs') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: ['system.number'] }])
  static abs(@Meta(ArgName, 'x') @Meta(SchemaType, 'T') x: BigNumber): BigNumber { return toBN(x).abs(); }

  @Meta(SchemaType, 'system.math.numeric.ceiling') @Meta(Return, NS_SYSTEM_INT)
  static ceiling(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: BigNumber): number { return Math.ceil(toBN(x).toNumber()); }

  @Meta(SchemaType, 'system.math.numeric.floor') @Meta(Return, NS_SYSTEM_INT)
  static floor(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: BigNumber): number { return Math.floor(toBN(x).toNumber()); }

  @Meta(SchemaType, 'system.math.numeric.clamp') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: ['system.number'] }])
  static clamp<T>(
    @Meta(ArgName, 'x') @Meta(SchemaType, 'T') x: BigNumber,
    @Meta(ArgName, 'min') @Meta(SchemaType, 'T') min: BigNumber,
    @Meta(ArgName, 'max') @Meta(SchemaType, 'T') max: BigNumber,
  ): BigNumber { return BigNumber.max(toBN(min), BigNumber.min(toBN(x), toBN(max))); }

  @Meta(SchemaType, 'system.math.numeric.max') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: ['system.number'] }])
  static max(@Meta(ArgName, 'values') @Meta(SchemaType, 'T') ...values: BigNumber[]): BigNumber {
    if (values.length === 0) return new BigNumber(0);
    return values.reduce((max, v) => BigNumber.max(toBN(max), toBN(v)));
  }

  @Meta(SchemaType, 'system.math.numeric.min') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: ['system.number'] }])
  static min(@Meta(ArgName, 'values') @Meta(SchemaType, 'T') ...values: BigNumber[]): BigNumber {
    if (values.length === 0) return new BigNumber(0);
    return values.reduce((min, v) => BigNumber.min(toBN(min), toBN(v)));
  }

  @Meta(SchemaType, 'system.math.numeric.percent') @Meta(Return, NS_SYSTEM_NUMBER)
  static percent(
    @Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: BigNumber,
    @Meta(ArgName, 'y') @Meta(SchemaType, NS_SYSTEM_NUMBER) y: BigNumber,
    @Meta(ArgName, 'decimals') @Meta(SchemaType, NS_SYSTEM_INT) decimals?: number,
  ): number {
    const pct = toBN(y).isZero() ? 0 : toBN(x).div(toBN(y)).times(100).toNumber();
    return decimals !== undefined ? +pct.toFixed(decimals) : pct;
  }

  @Meta(SchemaType, 'system.math.numeric.round') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: ['system.number'] }])
  static round<T>(
    @Meta(ArgName, 'x') @Meta(SchemaType, 'T') x: BigNumber,
    @Meta(ArgName, 'decimals') @Meta(SchemaType, NS_SYSTEM_INT) decimals?: number,
  ): BigNumber { return new BigNumber(toBN(x).toFixed(decimals ?? 0)); }

  @Meta(SchemaType, 'system.math.numeric.ptnum') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: ['system.number'] }])
  static ptnum<T>(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_FLOAT) x: number): BigNumber { return new BigNumber(x).div(100); }

  @Meta(SchemaType, 'system.math.numeric.exp') @Meta(Return, NS_SYSTEM_NUMBER)
  static exp(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: BigNumber): number { return Math.exp(toBN(x).toNumber()); }

  @Meta(SchemaType, 'system.math.numeric.log') @Meta(Return, NS_SYSTEM_NUMBER)
  static log(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: BigNumber): number { return Math.log(toBN(x).toNumber()); }

  @Meta(SchemaType, 'system.math.numeric.sqrt') @Meta(Return, NS_SYSTEM_NUMBER)
  static sqrt(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: BigNumber): BigNumber { return toBN(x).sqrt(); }

  @Meta(SchemaType, 'system.math.numeric.cbrt') @Meta(Return, NS_SYSTEM_NUMBER)
  static cbrt(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: BigNumber): number { return Math.cbrt(toBN(x).toNumber()); }

  @Meta(SchemaType, 'system.math.numeric.log10') @Meta(Return, NS_SYSTEM_NUMBER)
  static log10(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: BigNumber): number { return Math.log10(toBN(x).toNumber()); }

  @Meta(SchemaType, 'system.math.numeric.log2') @Meta(Return, NS_SYSTEM_NUMBER)
  static log2(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: BigNumber): number { return Math.log2(toBN(x).toNumber()); }

  @Meta(SchemaType, 'system.math.numeric.pow') @Meta(Return, NS_SYSTEM_NUMBER)
  static pow(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: BigNumber, @Meta(ArgName, 'y') @Meta(SchemaType, NS_SYSTEM_NUMBER) y: BigNumber): number {
    return Math.pow(toBN(x).toNumber(), toBN(y).toNumber());
  }
}

// ── Conversion ─────────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, 'system.math.conversion')
export class SystemMathConversion {
  @Meta(SchemaType, 'system.math.conversion.todecimal') @Meta(Return, NS_SYSTEM_NUMBER)
  static todecimal<T>(@Meta(ArgName, 'x') @Meta(SchemaType, 'T') x: BigNumber): BigNumber { return toBN(x); }

  @Meta(SchemaType, 'system.math.conversion.todouble') @Meta(Return, NS_SYSTEM_NUMBER)
  static todouble<T>(@Meta(ArgName, 'x') @Meta(SchemaType, 'T') x: BigNumber): number { return toBN(x).toNumber(); }

  @Meta(SchemaType, 'system.math.conversion.tointeger') @Meta(Return, NS_SYSTEM_INT)
  static tointeger<T>(@Meta(ArgName, 'x') @Meta(SchemaType, 'T') x: BigNumber): number { return toBN(x).integerValue().toNumber(); }

  @Meta(SchemaType, 'system.math.conversion.tosingle') @Meta(Return, NS_SYSTEM_FLOAT)
  static tosingle<T>(@Meta(ArgName, 'x') @Meta(SchemaType, 'T') x: BigNumber): number { return toBN(x).toNumber(); }
}

// ── Bitwise ────────────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, 'system.math.bitwise')
export class SystemMathBitwise {
  @Meta(SchemaType, 'system.math.bitwise.bitand') @Meta(Return, NS_SYSTEM_INT)
  static bitand(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_INT) x: number, @Meta(ArgName, 'y') @Meta(SchemaType, NS_SYSTEM_INT) y: number): number { return x & y; }

  @Meta(SchemaType, 'system.math.bitwise.bitor') @Meta(Return, NS_SYSTEM_INT)
  static bitor(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_INT) x: number, @Meta(ArgName, 'y') @Meta(SchemaType, NS_SYSTEM_INT) y: number): number { return x | y; }

  @Meta(SchemaType, 'system.math.bitwise.bitxor') @Meta(Return, NS_SYSTEM_INT)
  static bitxor(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_INT) x: number, @Meta(ArgName, 'y') @Meta(SchemaType, NS_SYSTEM_INT) y: number): number { return x ^ y; }

  @Meta(SchemaType, 'system.math.bitwise.bitunary') @Meta(Return, NS_SYSTEM_INT)
  static bitunary(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_INT) x: number): number { return ~x; }

  @Meta(SchemaType, 'system.math.bitwise.bitleftshift') @Meta(Return, NS_SYSTEM_INT)
  static bitleftshift(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_INT) x: number, @Meta(ArgName, 'shift') @Meta(SchemaType, NS_SYSTEM_INT) shift: number): number { return x << shift; }

  @Meta(SchemaType, 'system.math.bitwise.bitrightshift') @Meta(Return, NS_SYSTEM_INT)
  static bitrightshift(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_INT) x: number, @Meta(ArgName, 'shift') @Meta(SchemaType, NS_SYSTEM_INT) shift: number): number { return x >> shift; }
}

// ── Trigonometry ───────────────────────────────────────────────────────────

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, 'system.math.trigonometry')
export class SystemMathTrigonometry {
  @Meta(SchemaType, 'system.math.trigonometry.acos') @Meta(Return, NS_SYSTEM_NUMBER)
  static acos(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.acos(x); }
  @Meta(SchemaType, 'system.math.trigonometry.asin') @Meta(Return, NS_SYSTEM_NUMBER)
  static asin(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.asin(x); }
  @Meta(SchemaType, 'system.math.trigonometry.atan') @Meta(Return, NS_SYSTEM_NUMBER)
  static atan(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.atan(x); }
  @Meta(SchemaType, 'system.math.trigonometry.cos') @Meta(Return, NS_SYSTEM_NUMBER)
  static cos(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.cos(x); }
  @Meta(SchemaType, 'system.math.trigonometry.sin') @Meta(Return, NS_SYSTEM_NUMBER)
  static sin(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.sin(x); }
  @Meta(SchemaType, 'system.math.trigonometry.tan') @Meta(Return, NS_SYSTEM_NUMBER)
  static tan(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.tan(x); }
  @Meta(SchemaType, 'system.math.trigonometry.acosh') @Meta(Return, NS_SYSTEM_NUMBER)
  static acosh(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.acosh(x); }
  @Meta(SchemaType, 'system.math.trigonometry.asinh') @Meta(Return, NS_SYSTEM_NUMBER)
  static asinh(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.asinh(x); }
  @Meta(SchemaType, 'system.math.trigonometry.atanh') @Meta(Return, NS_SYSTEM_NUMBER)
  static atanh(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.atanh(x); }
  @Meta(SchemaType, 'system.math.trigonometry.cosh') @Meta(Return, NS_SYSTEM_NUMBER)
  static cosh(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.cosh(x); }
  @Meta(SchemaType, 'system.math.trigonometry.sinh') @Meta(Return, NS_SYSTEM_NUMBER)
  static sinh(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.sinh(x); }
  @Meta(SchemaType, 'system.math.trigonometry.tanh') @Meta(Return, NS_SYSTEM_NUMBER)
  static tanh(@Meta(ArgName, 'x') @Meta(SchemaType, NS_SYSTEM_NUMBER) x: number): number { return Math.tanh(x); }
}
