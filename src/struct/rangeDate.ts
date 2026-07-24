import { Meta } from "../attribute";
import { OfSchema, SchemaType } from "../property";
import { SCHEMA_KIND_STRUCT, NS_SYSTEM_RANGE_DATE, NS_SYSTEM_DATE } from "../utility";

export interface RangeDate {
  start?: Date;
  end?: Date;
}

@Meta(OfSchema, SCHEMA_KIND_STRUCT)
@Meta(SchemaType, NS_SYSTEM_RANGE_DATE)
class RangeDateMeta implements RangeDate {
  @Meta(SchemaType, NS_SYSTEM_DATE)
  start?: Date;
  
  @Meta(SchemaType, NS_SYSTEM_DATE)
  end?: Date;
}