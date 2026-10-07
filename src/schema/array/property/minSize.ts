import { buildFuncCall } from '../../../schema/function/type';
import { Alias } from '../../../property/core/alias';
import { ForSchema } from '../../../property/core/forSchema';
import { ConstraintProperty } from '../../../property/constraintProperty';
import { OfNodeKind } from '../../../property/core/ofNodeKind';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { SchemaType } from '../../../property/core/schemaType';
import { Meta } from '../../../attribute/meta';
import { Relation } from '../../../attribute/relation';
import { Error } from '../../../property/common/error';
import { ArrayNode } from '../../../schema/array/node';
import { LowLimitInt } from '../../int/property/lowLimit';
import { UpLimitInt } from '../../int/property/upLimit';

import type { IValueAccess } from '../../../interface';

import { NS_SYSTEM_INT, NS_SYSTEM_INTRINSIC, NS_SYSTEM_SCHEMA_PRO_ARRAY, SCHEMA_KIND_NODE_ARRAY, SCHEMA_KIND_NODE_ARRAY_USAGE, NODE_KIND_PROPERTY } from '../../../utility/constant';

/** The minimum size constraint property for array data node */
@Meta(Alias, 'minSize')
@Meta(ForSchema, [SCHEMA_KIND_NODE_ARRAY, SCHEMA_KIND_NODE_ARRAY_USAGE])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
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
  override effect(target: IValueAccess) {
    if (target instanceof ArrayNode && !target.readonly && this.hasValue) {
      while (target.length < this._value!)
        target.addRow();
    }
  }
}
