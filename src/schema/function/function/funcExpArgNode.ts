import type { IPropertyProvider, IValueAccess } from "../../../interface";
import { StringNode } from "../../string/node";
import { StructNode } from "../../struct/node";
import { StructType } from "../../struct/runtime";
import { ValueType } from "../../value/runtime";

export class FuncExpArgNode extends StructNode {
  /** The argument type. */
  readonly argType: StringNode;

  /** The argument source. */
  readonly argSource: StringNode;

  constructor(type: ValueType, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type as StructType, value, parent, propProvider);

    this.argType = this.getAccessValue("type") as StringNode;
    this.argSource = this.getAccessValue("source") as StringNode;
  }
}