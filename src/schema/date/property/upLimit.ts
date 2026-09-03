import { Meta } from "../../../attribute/meta";
import { Alias } from "../../../property/core/alias";
import { ForSchema } from "../../../property/core/forSchema";
import { OfSchema } from "../../../property/core/ofSchema";
import { PropertyValueType } from "../../../property/core/propertyValueType";
import { SchemaType } from "../../../property/core/schemaType";
import { Error } from "../../../property/common/error";
import { ConstraintProperty } from "../../../property/constraintProperty";

import type { IValueAccess } from "../../../interface";

import { NS_SYSTEM_DATE, NS_SYSTEM_SCHEMA_PRO_DATE, SCHEMA_KIND_DATE, SCHEMA_KIND_DATE_DEFINE, SCHEMA_KIND_DATE_USAGE, SCHEMA_KIND_PROPERTY } from "../../../utility/constant";
import { isNull, parseDate } from "../../../utility/toolset";

@Meta(Alias, 'uplimit')
@Meta(ForSchema, [SCHEMA_KIND_DATE, SCHEMA_KIND_DATE_DEFINE, SCHEMA_KIND_DATE_USAGE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_DATE}.uplimit`)
@Meta(PropertyValueType, NS_SYSTEM_DATE)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PRO_DATE}.uplimit.error`)
export class UpLimitDate extends ConstraintProperty<Date> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    const value = node.getValue() as Date;
    if (isNull(value) || isNull(this._value)) return undefined;
    const upLimit = parseDate(this._value);
    if (!upLimit) return undefined;
    return value <= upLimit;
  }
}