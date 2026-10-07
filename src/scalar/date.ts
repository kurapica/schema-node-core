import { Meta } from '../attribute/meta';
import { OfNodeKind } from '../property/core/ofNodeKind';
import { SchemaType } from '../property/core/schemaType';
import { Base } from '../property/core/base';

import { NODE_KIND_DATE, NS_SYSTEM_DATE, NS_SYSTEM_FULL_DATE, NS_SYSTEM_YEARMONTH } from '../utility/constant';

/** Represents the date type */
@Meta(OfNodeKind, NODE_KIND_DATE)
@Meta(SchemaType, NS_SYSTEM_DATE)
class DateMeta {}

/** Represents the full date type */
@Meta(OfNodeKind, NODE_KIND_DATE)
@Meta(SchemaType, NS_SYSTEM_FULL_DATE)
@Meta(Base, NS_SYSTEM_DATE)
class FullDateMeta {}

/** Represents the year-month type */
@Meta(OfNodeKind, NODE_KIND_DATE)
@Meta(SchemaType, NS_SYSTEM_YEARMONTH)
@Meta(Base, NS_SYSTEM_DATE)
class YearMonthMeta {}