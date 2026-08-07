import { IPropertyProvider, IValueAccess, StructType } from "../runtime";
import { ArrayNode } from "./arrayNode";
import { DataNode } from "./dataNode";
import { StringNode } from "./scalarNode";

/** The function node contains the function definition */
export class FunctionNode extends DataNode
{
  readonly return: StringNode;
  readonly args: ;
  readonly exps: ArrayNode;

  constructor(type: StructType, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, undefined, parent, propProvider);

    
  }
}