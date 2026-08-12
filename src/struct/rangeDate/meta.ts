import { Meta } from '../../attribute/meta';
import { SchemaType } from '../../property/core/schemaType';
import { NS_SYSTEM_RANGE_DATE, NS_SYSTEM_DATE, NS_SYSTEM_RANGE_FULL_DATE, NS_SYSTEM_FULL_DATE, NS_SYSTEM_RANGE_MONTH, NS_SYSTEM_YEARMONTH, NS_SYSTEM_RANGE_YEAR, NS_SYSTEM_YEAR } from '../../utility/constant';
import type { RangeDate } from './type';

@Meta(SchemaType, NS_SYSTEM_RANGE_DATE)
class RangeDateMeta implements RangeDate {
  @Meta(SchemaType, NS_SYSTEM_DATE)
  start?: Date;
  
  @Meta(SchemaType, NS_SYSTEM_DATE)
  end?: Date;
}

@Meta(SchemaType, NS_SYSTEM_RANGE_FULL_DATE)
class RangeFullDateMeta implements RangeDate {
  @Meta(SchemaType, NS_SYSTEM_FULL_DATE)
  start?: Date;
  
  @Meta(SchemaType, NS_SYSTEM_FULL_DATE)
  end?: Date;
}

@Meta(SchemaType, NS_SYSTEM_RANGE_MONTH)
class RangeMonthMeta implements RangeDate {
  @Meta(SchemaType, NS_SYSTEM_YEARMONTH)
  start?: Date;
  
  @Meta(SchemaType, NS_SYSTEM_YEARMONTH)
  end?: Date;
}

@Meta(SchemaType, NS_SYSTEM_RANGE_YEAR)
class RangeYearMeta {
  @Meta(SchemaType, NS_SYSTEM_YEAR)
  start?: number;
  
  @Meta(SchemaType, NS_SYSTEM_YEAR)
  end?: number;
}