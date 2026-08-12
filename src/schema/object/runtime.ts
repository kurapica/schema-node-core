import type { IPropertyProvider } from "../../interface/propertyProvider";
import type { IValueAccess } from "../../interface/valueAccess";
import { ScalarType } from "../value/scalar";
import { AnyNode } from "./node";

export class ObjectType extends ScalarType {
  override create(value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider): AnyNode { return new AnyNode(this, value, parent, propProvider); }
}
