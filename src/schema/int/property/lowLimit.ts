import { Meta } from "../../../attribute/meta";
import { Alias } from "../../../property/core/alias";
import { ForSchema } from "../../../property/core/forSchema";
import { OfSchema } from "../../../property/core/ofSchema";
import { PropertyValueType } from "../../../property/core/propertyValueType";
import { SchemaType } from "../../../property/core/schemaType";
import { Error } from "../../../property/common/error";
import { ConstraintProperty } from "../../../property/constraintProperty";
import { isNull } from "../../../utility/toolset";

import type { IValueAccess } from "../../../interface";
import { NS_SYSTEM_INT, NS_SYSTEM_SCHEMA_PRO_INT, SCHEMA_KIND_INT, SCHEMA_KIND_INT_DEFINE, SCHEMA_KIND_INT_USAGE, SCHEMA_KIND_PROPERTY } from "../../../utility/constant";

@Meta(Alias, 'lowlimit')
@Meta(ForSchema, [SCHEMA_KIND_INT, SCHEMA_KIND_INT_DEFINE, SCHEMA_KIND_INT_USAGE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_INT}.lowlimit`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PRO_INT}.lowlimit.error`)
export class LowLimitInt extends ConstraintProperty<number> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    const value = node.getValue() as number;
    if (isNull(value) || isNull(this._value)) return undefined;
    return value >= this._value!;
  }
}
