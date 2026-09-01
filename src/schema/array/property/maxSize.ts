import { ForSchema } from '../../../property/core/forSchema';
import { ConstraintProperty } from '../../../property/constraintProperty';
import { OfSchema } from '../../../property/core/ofSchema';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { SchemaType } from '../../../property/core/schemaType';
import { Meta } from '../../../attribute/meta';
import { Error } from '../../../property/common/error';
import { LowLimitInt } from '../../int/property/lowLimit';

import type { IValueAccess } from '../../../interface';

import { NS_SYSTEM_INT, NS_SYSTEM_SCHEMA_PROPERTY_ARRAY, SCHEMA_KIND_ARRAY, SCHEMA_KIND_ARRAY_USAGE, SCHEMA_KIND_PROPERTY } from '../../../utility/constant';

/** The maximum size constraint property for array data node */
@Meta(ForSchema, [SCHEMA_KIND_ARRAY, SCHEMA_KIND_ARRAY_USAGE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_ARRAY}.maxsize`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
@Meta(LowLimitInt, 0)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_ARRAY}.maxsize.error`)
export class MaxSize extends ConstraintProperty<number> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (!this.hasValue) return undefined;
    const val = node.getValue();
    if (!Array.isArray(val)) return undefined;
    return val.length <= this._value!;
  }
}
