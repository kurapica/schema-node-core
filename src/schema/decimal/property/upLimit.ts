import { Meta } from "../../../attribute/meta";
import { Alias } from "../../../property/core/alias";
import { ForSchema } from "../../../property/core/forSchema";
import { OfSchema } from "../../../property/core/ofSchema";
import { PropertyValueType } from "../../../property/core/propertyValueType";
import { SchemaType } from "../../../property/core/schemaType";
import { Error } from "../../../property/common/error";
import { ConstraintProperty } from "../../../property/constraintProperty";
import { isNull } from "../../../utility/toolset";
import { StackUpLimit } from "../../../property/common/stackUpLimit";

import type { IValueAccess } from "../../../interface";

import { NS_SYSTEM_NUMBER, NS_SYSTEM_SCHEMA_PROPERTY_DECIMAL, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_DECIMAL_DEFINE, SCHEMA_KIND_DECIMAL_USAGE, SCHEMA_KIND_PROPERTY } from "../../../utility/constant";

@Meta(Alias, 'uplimit')
@Meta(ForSchema, [SCHEMA_KIND_DECIMAL, SCHEMA_KIND_DECIMAL_DEFINE, SCHEMA_KIND_DECIMAL_USAGE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_DECIMAL}.uplimit`)
@Meta(PropertyValueType, NS_SYSTEM_NUMBER)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_DECIMAL}.uplimit.error`)
export class UpLimitNumber extends ConstraintProperty<number> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    const value = node.getValue() as number;
    if (isNull(value) || isNull(this._value)) return undefined;
    if (node.getPropertyValue<boolean>(StackUpLimit))
    {
      let original = node.original as number;
      if (!isNull(original))
      {
        original = parseFloat(`${original}`);
        if (!isNaN(original))
          return value <= this._value! + original;
      }
    }
    return value <= this._value!;
  }
}
