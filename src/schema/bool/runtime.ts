import type { IPropertyProvider } from "../../interface/propertyProvider";
import type { IValueAccess } from "../../interface/valueAccess";
import { ScalarType } from "../value/scalar";
import { BoolNode } from "./node";

export class BoolType extends ScalarType {
  override create(value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider): BoolNode { return new BoolNode(this, value, parent, propProvider); }
  override get isIndexable(): boolean { return true; }
}
