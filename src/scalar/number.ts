import { Meta } from '../attribute/meta';
import { OfSchema } from '../property/core/ofSchema';
import { SchemaType } from '../property/core/schemaType';
import { Base } from '../property/core/base';

import { NS_SYSTEM_DOUBLE, NS_SYSTEM_FLOAT, NS_SYSTEM_INT, NS_SYSTEM_NUMBER, NS_SYSTEM_PERCENT, NS_SYSTEM_YEAR, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_INT } from '../utility/constant';
import { JsRegex } from '../property/common/jsRegex';
import { UpLimitInt } from '../schema/int/property/upLimit';
import { LowLimitInt } from '../schema/int/property/lowLimit';

/** Represents the number type */
@Meta(OfSchema, SCHEMA_KIND_DECIMAL)
@Meta(SchemaType, NS_SYSTEM_NUMBER)
@Meta(JsRegex, "^(\\-|\\+)?\\d+(\\.\\d+)?(e\\-\\d+)?$")
class NumberMeta {}

@Meta(OfSchema, SCHEMA_KIND_DECIMAL)
@Meta(SchemaType, NS_SYSTEM_DOUBLE)
@Meta(Base, NS_SYSTEM_NUMBER)
@Meta(JsRegex, "^(\\-|\\+)?\\d+\\.?\\d+$")
class DoubleMeta {}

@Meta(OfSchema, SCHEMA_KIND_DECIMAL)
@Meta(SchemaType, NS_SYSTEM_FLOAT)
@Meta(Base, NS_SYSTEM_NUMBER)
@Meta(JsRegex, "^(\\-|\\+)?\\d+\\.?\\d+$")
class FloatMeta {}

@Meta(OfSchema, SCHEMA_KIND_INT)
@Meta(SchemaType, NS_SYSTEM_INT)
@Meta(JsRegex, "^(\\-|\\+)?\\d+$")
class IntMeta {}

@Meta(OfSchema, SCHEMA_KIND_INT)
@Meta(SchemaType, NS_SYSTEM_PERCENT)
@Meta(Base, NS_SYSTEM_FLOAT)
@Meta(UpLimitInt,100)
@Meta(LowLimitInt,0)
@Meta(JsRegex, "^\\d+(\\.\\d+)?$")
class PercentMeta {}

@Meta(OfSchema, SCHEMA_KIND_INT)
@Meta(SchemaType, NS_SYSTEM_YEAR)
@Meta(Base, NS_SYSTEM_INT)
@Meta(LowLimitInt,0)
@Meta(JsRegex, "^\\d{4}$")
class YearMeta {}