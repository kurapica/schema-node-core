import { buildFuncCall } from '../../../schema/function/type';
import { ForSchema } from '../../../property/core/forSchema';
import { ConstraintProperty } from '../../../property/constraintProperty';
import { OfSchema } from '../../../property/core/ofSchema';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { SchemaType } from '../../../property/core/schemaType';
import { Meta } from '../../../attribute/meta';
import { Relation } from '../../../attribute/relation';
import { Error } from '../../../property/common/error';
import { ArrayNode } from '../../../schema/array/node';
import { LowLimitInt } from '../../int/property/lowLimit';
import { UpLimitInt } from '../../int/property/upLimit';

import type { IValueAccess } from '../../../interface';

import { NS_SYSTEM_INT, NS_SYSTEM_INTRINSIC, NS_SYSTEM_SCHEMA_PRO_ARRAY, SCHEMA_KIND_ARRAY, SCHEMA_KIND_ARRAY_USAGE, SCHEMA_KIND_PROPERTY } from '../../../utility/constant';

/** The minimum size constraint property for array data node */
@Meta(ForSchema, [SCHEMA_KIND_ARRAY, SCHEMA_KIND_ARRAY_USAGE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_ARRAY}.minsize`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
@Meta(LowLimitInt, 0)
@Relation(UpLimitInt,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@maxSize'))
@Meta(Error, `${NS_SYSTEM_SCHEMA_PRO_ARRAY}.minsize.error`)
export class MinSize extends ConstraintProperty<number> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (!this.hasValue) return undefined;
    const val = node.getValue();
    if (!Array.isArray(val)) return undefined;
    return val.length >= this._value!;
  }

  /** Add elements to the array to meet the minimum size constraint */
  override effect(target: IValueAccess, newValue?: unknown, oldValue?: unknown, source?: IValueAccess) {
    if (target instanceof ArrayNode && !this.hasValue) {
      while (target.length < this._value!)
        target.addRow();
    }
  }
}
