// =============================================================================
// EnumNode — enum value node with cascading support
// Mirrors C# SchemaNode.Core/Node/EnumNode.cs
// =============================================================================

import { EnumValueType } from "../../enum/enumValueType";
import { isNull } from "../../utility/toolset";
import { DataNode } from "../value/node";
import { EnumType } from "./runtime";

export class EnumNode extends DataNode {
  override getValue() {
    const value = this._value;
    return isNull(value) ? null : (this.type as EnumType).type === EnumValueType.String ? `${value}` : parseInt(`${value}`);
  }
}
