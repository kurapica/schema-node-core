import { Meta } from "../../../attribute/meta";
import { Alias } from "../../../property/core/alias";
import { ForSchema } from "../../../property/core/forSchema";
import { OfSchema } from "../../../property/core/ofSchema";
import { PropertyValueType } from "../../../property/core/propertyValueType";
import { SchemaType } from "../../../property/core/schemaType";
import { Error } from "../../../property/common/error";
import { ConstraintProperty } from "../../../property/constraintProperty";

import type { IValueAccess } from "../../../interface";
import { NS_SYSTEM_NUMBER, NS_SYSTEM_SCHEMA_PRO_DECIMAL, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_DECIMAL_DEFINE, SCHEMA_KIND_DECIMAL_USAGE, SCHEMA_KIND_PROPERTY } from "../../../utility/constant";
import { isNull } from "../../../utility/toolset";

@Meta(Alias, 'lowlimit')
@Meta(ForSchema, [SCHEMA_KIND_DECIMAL, SCHEMA_KIND_DECIMAL_DEFINE, SCHEMA_KIND_DECIMAL_USAGE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_DECIMAL}.lowlimit`)
@Meta(PropertyValueType, NS_SYSTEM_NUMBER)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PRO_DECIMAL}.lowlimit.error`)
export class LowLimitNumber extends ConstraintProperty<number> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    const value = node.getValue() as number;
    if (isNull(value) || isNull(this._value)) return undefined;
    return value >= this._value!;
  }
}
