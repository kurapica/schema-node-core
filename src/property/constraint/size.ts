import { buildFuncCall } from '../../schema/function/type';
import { ForSchema } from '../core/forSchema';
import { ConstraintProperty } from '../constraintProperty';
import { LowLimitInt } from './lowLimit';
import { OfSchema } from '../core/ofSchema';
import { PropertyValueType } from '../core/propertyValueType';
import { SchemaType } from '../core/schemaType';
import { UpLimitInt } from './upLimit';
import { Meta } from '../../attribute/meta';
import { Relation } from '../../attribute/relation';
import type { IValueAccess } from '../../interface';
import { NS_SYSTEM_INT, NS_SYSTEM_INTRINSIC, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, SCHEMA_KIND_ARRAY, SCHEMA_KIND_PROPERTY } from '../../utility/constant';
import { Error } from '../common/error';
import { ArrayNode } from '../../schema/array/node';

/** The minimum size constraint property for array data node */
@Meta(ForSchema, [SCHEMA_KIND_ARRAY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.minsize`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
@Meta(LowLimitInt, 0)
@Relation(UpLimitInt,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@maxSize'))
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.minsize.error`)
export class MinSize extends ConstraintProperty<number> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (!this.hasValue || !(node instanceof ArrayNode)) return undefined;
    return (node as any).length >= this._value!;
  }

  /** Add elements to the array to meet the minimum size constraint */
  override effect(target: IValueAccess, newValue?: unknown, oldValue?: unknown, source?: IValueAccess) {
    if (target instanceof ArrayNode && !this.hasValue) {
      while (target.length < this._value!)
        target.addRow();
    }
  }
}

/** The maximum size constraint property for array data node */
@Meta(ForSchema, [SCHEMA_KIND_ARRAY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.maxsize`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
@Meta(LowLimitInt, 0)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.maxsize.error`)
export class MaxSize extends ConstraintProperty<number> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (!this.hasValue || !(node instanceof ArrayNode)) return undefined;
    return node.length >= this._value!;
  }
}
