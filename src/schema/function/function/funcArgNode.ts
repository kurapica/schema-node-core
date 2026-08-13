import { ReadOnly } from "../../../property/common/readOnly";
import { BoolNode } from "../../bool/node";
import { StringNode } from "../../string/node";
import { StructNode } from "../../struct/node";
import { StructType } from "../../struct/runtime";

import type { IPropertyProvider, IValueAccess } from "../../../interface";
import type { FuncArg } from "../type";

/** The function argument node */
export class FuncArgNode extends StructNode
{
  /** The argument name. */
  readonly argName: StringNode;

  /** The argument type. */
  readonly argType: StringNode;

  /** The argument is required. */
  readonly argRequire: BoolNode;

  /** The argument is variadic. */
  readonly argVariadic: BoolNode;

  constructor(type: StructType, value: FuncArg | undefined, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, value, parent, propProvider);

    this.argName = this.getAccessValue("name") as StringNode;
    this.argType = this.getAccessValue("type") as StringNode;
    this.argRequire = this.getAccessValue("require") as BoolNode;
    this.argVariadic = this.getAccessValue("variadic") as BoolNode;
  }

  /** The arguments are unmodifiable. */
  set unModifiable(value: boolean) {
    this.argName.setPropertyValue(ReadOnly, value ? true : undefined, this.parent);
    this.argType.setPropertyValue(ReadOnly, value ? true : undefined, this.parent);
    this.argRequire.setPropertyValue(ReadOnly, value ? true : undefined, this.parent);
    this.argVariadic.setPropertyValue(ReadOnly, value ? true : undefined, this.parent);
  }
}