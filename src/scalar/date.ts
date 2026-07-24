import { Meta } from "../attribute";
import { OfSchema, SchemaType } from "../property";
import { Base } from "../property/core";
import { SCHEMA_KIND_DATE, NS_SYSTEM_DATE, NS_SYSTEM_FULL_DATE, NS_SYSTEM_YEARMONTH } from "../utility";

/** Represents the date type */
@Meta(OfSchema, SCHEMA_KIND_DATE)
@Meta(SchemaType, NS_SYSTEM_DATE)
class DateMeta {}

/** Represents the full date type */
@Meta(OfSchema, SCHEMA_KIND_DATE)
@Meta(SchemaType, NS_SYSTEM_FULL_DATE)
@Meta(Base, NS_SYSTEM_DATE)
class FullDateMeta {}

/** Represents the year-month type */
@Meta(OfSchema, SCHEMA_KIND_DATE)
@Meta(SchemaType, NS_SYSTEM_YEARMONTH)
@Meta(Base, NS_SYSTEM_DATE)
class YearMonthMeta {}