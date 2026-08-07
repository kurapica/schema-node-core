import { buildFuncCall, ForSchema, IConstraintProperty, LowLimitInt, OfSchema, Property, PropertyValueType, SchemaType, UpLimitInt } from "..";
import { Meta, Relation } from "../../attribute";
import { ArrayNode } from "../../node";
import { Call } from "../../relation";
import { IValueAccess } from "../../runtime";
import { NS_SYSTEM_INT, NS_SYSTEM_INTRINSIC, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, SCHEMA_KIND_ARRAY, SCHEMA_KIND_PROPERTY } from "../../utility";
import { Error } from '../common';

/** The minimum size constraint property for array data node */
@Meta(ForSchema, [SCHEMA_KIND_ARRAY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.minsize`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
@Meta(LowLimitInt, 0)
@Relation(UpLimitInt, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@maxSize'))
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.minsize.error`)
export class MinSize extends Property<number> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (!this.hasValue || !(node instanceof ArrayNode)) return undefined;
    return node.length >= this._value!;
  }

  /** Add elements to the array to meet the minimum size constraint */
  override effect(target: IValueAccess, newValue?: unknown | undefined, oldValue?: unknown | undefined) {
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
export class MaxSize extends Property<number> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (!this.hasValue || !(node instanceof ArrayNode)) return undefined;
    return node.length >= this._value!;
  }
}
