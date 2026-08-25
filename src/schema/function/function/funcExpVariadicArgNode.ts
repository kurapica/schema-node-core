import { StructType } from "../../struct/runtime";
import { FuncExpArgNode } from "./funcExpArgNode";

import type { IPropertyProvider, IValueAccess, IValueTypeAccess } from "../../../interface";
import type { CallArg } from "../type";

export class FuncExpVariadicArgNode extends FuncExpArgNode {
  constructor(type: IValueTypeAccess, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type as StructType, value as CallArg | undefined, parent, propProvider);
  }
}