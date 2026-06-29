import BigNumber from 'bignumber.js';
import { Meta } from '../attribute/meta';
import { OfSchema, SchemaType, Return, Generics } from '../property/index';
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_NUMBER, NS_SYSTEM_INT } from '../utility/constant';

function toBN(v: unknown): BigNumber { return v instanceof BigNumber ? v : new BigNumber(v as BigNumber.Value); }

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, 'system.math')
export class SystemMath {
  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.math.add') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: ['system.number'] }])
  static add(@Meta(SchemaType, 'T') x: BigNumber, @Meta(SchemaType, 'T') y: BigNumber): BigNumber { return toBN(x).plus(toBN(y)); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.math.subtract') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: ['system.number'] }])
  static subtract(@Meta(SchemaType, 'T') x: BigNumber, @Meta(SchemaType, 'T') y: BigNumber): BigNumber { return toBN(x).minus(toBN(y)); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.math.multiply') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: ['system.number'] }])
  static multiply(@Meta(SchemaType, 'T') x: BigNumber, @Meta(SchemaType, 'T') y: BigNumber): BigNumber { return toBN(x).times(toBN(y)); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.math.divide') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: ['system.number'] }])
  static divide(@Meta(SchemaType, 'T') x: BigNumber, @Meta(SchemaType, 'T') y: BigNumber): BigNumber { return toBN(x).div(toBN(y)); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.math.modulo') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: ['system.number'] }])
  static modulo(@Meta(SchemaType, 'T') x: BigNumber, @Meta(SchemaType, 'T') y: BigNumber): BigNumber { return toBN(x).mod(toBN(y)); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.math.numeric.abs') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: ['system.number'] }])
  static abs(@Meta(SchemaType, 'T') x: BigNumber): BigNumber { return toBN(x).abs(); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.math.numeric.max') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: ['system.number'] }])
  static max(@Meta(SchemaType, 'T') x: BigNumber, @Meta(SchemaType, 'T') y: BigNumber): BigNumber { return BigNumber.max(toBN(x), toBN(y)); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.math.numeric.min') @Meta(Return, 'T') @Meta(Generics, [{ name: 'T', compatibles: ['system.number'] }])
  static min(@Meta(SchemaType, 'T') x: BigNumber, @Meta(SchemaType, 'T') y: BigNumber): BigNumber { return BigNumber.min(toBN(x), toBN(y)); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.math.numeric.sqrt') @Meta(Return, NS_SYSTEM_NUMBER)
  static sqrt(@Meta(SchemaType, NS_SYSTEM_NUMBER) x: BigNumber): BigNumber { return toBN(x).sqrt(); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.math.const.e') @Meta(Return, NS_SYSTEM_NUMBER)
  static e(): BigNumber { return new BigNumber(Math.E); }

  @Meta(OfSchema, SCHEMA_KIND_FUNCTION) @Meta(SchemaType, 'system.math.const.pi') @Meta(Return, NS_SYSTEM_NUMBER)
  static pi(): BigNumber { return new BigNumber(Math.PI); }
}
