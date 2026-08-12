import type { IPropertyProvider, IValueAccess } from "../../../interface";
import { ArrayNodeTemplate } from "../../array/node";
import { StructType } from "../../struct/runtime";
import { ValueType } from "../../value/runtime";
import type { CallArg } from "../type";
import { FuncExpArgNode } from "./funcExpArgNode";

export class FuncExpVariadicArgNode extends ArrayNodeTemplate<FuncExpArgNode> {
  constructor(type: ValueType, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type as StructType, value as CallArg | undefined, parent, propProvider);
  }
}