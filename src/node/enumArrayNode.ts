import { EnumValueType } from "../enum/enumValueType";
import { IValueAccess, IPropertyProvider } from "../runtime/interfaces";
import { ArrayType, EnumType } from "../runtime/type";
import { DataNode } from "./dataNode";

export class EnumArrayNode extends DataNode {
  private _enumType: EnumType;

  constructor(type: ArrayType, value?: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
      super(type, value, parent, propProvider);
      this._enumType = type.element as EnumType;
  }

  override getValue(): unknown[] {
    const value = this._value as unknown[];
    if (!Array.isArray(value)) return [];
    return value.map((item) => this._enumType.type === EnumValueType.String ? `${item}` : parseInt(`${item}`));
  }
}