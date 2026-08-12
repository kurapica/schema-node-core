import { EnumValueType } from "../../enum/enumValueType";
import type { IPropertyProvider } from "../../interface/propertyProvider";
import type { IValueAccess } from "../../interface/valueAccess";
import { ArrayType } from "../array";
import { DataNode } from "../value/node";
import { EnumType } from "./runtime";

export class EnumArrayNode extends DataNode {
  readonly enumType: EnumType;

  constructor(type: ArrayType, value?: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
      super(type, value, parent, propProvider);
      this.enumType = type.element as EnumType;
  }

  override getValue(): unknown[] {
    const value = this._value as unknown[];
    if (!Array.isArray(value)) return [];
    return value.map((item) => this.enumType.type === EnumValueType.String ? `${item}` : parseInt(`${item}`));
  }

  get length() {
    return (this.rawValue as unknown[]).length;
  }
}