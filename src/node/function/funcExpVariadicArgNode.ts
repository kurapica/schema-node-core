import { ValueType, IValueAccess, IPropertyProvider, StructType } from "../../runtime";
import { CallArg } from "../../schema";
import { ArrayNodeTemplate } from "../arrayNode";
import { FuncExpArgNode } from "./funcExpArgNode";

export class FuncExpVariadicArgNode extends ArrayNodeTemplate<FuncExpArgNode> {
  constructor(type: ValueType, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type as StructType, value as CallArg | undefined, parent, propProvider);
  }
}