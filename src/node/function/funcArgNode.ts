import { StringNode, StructNode } from "..";
import { StructType, IValueAccess, IPropertyProvider } from "../../runtime";
import { FuncArg } from "../../schema";

/** The function argument node */
export class FuncArgNode extends StructNode
{
  /** The argument name. */
  readonly argName: StringNode;

  /** The argument type. */
  readonly argType: StringNode;

  constructor(type: StructType, value: FuncArg | undefined, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, value, parent, propProvider);

    this.argName = this.getAccessValue("name") as StringNode;
    this.argType = this.getAccessValue("type") as StringNode;
  }
}