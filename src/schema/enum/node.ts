// =============================================================================
// EnumNode — enum value node with cascading support
// Mirrors C# SchemaNode.Core/Node/EnumNode.cs
// =============================================================================

import { EnumValueType } from "../../enum/enumValueType/type";
import type { IPropertyProvider, IValueAccess } from "../../interface";
import { isNull } from "../../utility/toolset";
import type { ArrayType } from "../array/runtime";
import { ScalarNode } from "../object/node";
import { EnumType } from "./runtime";

export class EnumNode extends ScalarNode {
  override getValue() {
    const value = this.rawValue;
    return isNull(value) ? null : (this.type as EnumType).type === EnumValueType.String ? `${value}` : parseInt(`${value}`);
  }
}

/** Enum array node */
export class EnumArrayNode extends ScalarNode {
  readonly enumType: EnumType;

  constructor(type: ArrayType, value?: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
      super(type, value, parent, propProvider);
      this.enumType = type.element as EnumType;
  }

  override getValue(): unknown[] {
    const value = this.rawValue as unknown[];
    if (!Array.isArray(value)) return [];
    return value.map((item) => this.enumType.type === EnumValueType.String ? `${item}` : parseInt(`${item}`));
  }

  get length() {
    return (this.rawValue as unknown[]).length;
  }
}