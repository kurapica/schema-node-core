import { StringNode, StructNode } from "..";
import { IValueAccess, IPropertyProvider, ValueType, StructType } from "../../runtime";

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