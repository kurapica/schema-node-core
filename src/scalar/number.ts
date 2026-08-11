import { Meta } from '../attribute/meta';
import { LowLimitNumber } from '../property/constraint/lowLimit';
import { OfSchema } from '../property/core/ofSchema';
import { SchemaType } from '../property/core/schemaType';
import { UpLimitNumber } from '../property/constraint/upLimit';
import { Base } from '../property/core/base';
import { NS_SYSTEM_DOUBLE, NS_SYSTEM_FLOAT, NS_SYSTEM_INT, NS_SYSTEM_NUMBER, NS_SYSTEM_PERCENT, NS_SYSTEM_YEAR, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_INT } from '../utility/constant';

/** Represents the number type */
@Meta(OfSchema, SCHEMA_KIND_DECIMAL)
@Meta(SchemaType, NS_SYSTEM_NUMBER)
class NumberMeta {}

@Meta(OfSchema, SCHEMA_KIND_DECIMAL)
@Meta(SchemaType, NS_SYSTEM_DOUBLE)
@Meta(Base, NS_SYSTEM_NUMBER)
class DoubleMeta {}

@Meta(OfSchema, SCHEMA_KIND_DECIMAL)
@Meta(SchemaType, NS_SYSTEM_FLOAT)
@Meta(Base, NS_SYSTEM_NUMBER)
class FloatMeta {}

@Meta(OfSchema, SCHEMA_KIND_INT)
@Meta(SchemaType, NS_SYSTEM_INT)
class IntMeta {}

@Meta(OfSchema, SCHEMA_KIND_INT)
@Meta(SchemaType, NS_SYSTEM_PERCENT)
@Meta(Base, NS_SYSTEM_FLOAT)
@Meta(UpLimitNumber,100)
@Meta(LowLimitNumber,0)
class PercentMeta {}

@Meta(OfSchema, SCHEMA_KIND_INT)
@Meta(SchemaType, NS_SYSTEM_YEAR)
@Meta(Base, NS_SYSTEM_INT)
@Meta(LowLimitNumber,0)
class YearMeta {}