// =============================================================================
// EnumNode — enum value node with cascading support
// Mirrors C# SchemaNode.Core/Node/EnumNode.cs
// =============================================================================

import { DataNode } from './dataNode';
import { EnumValueType } from '../enum/enumValueType';
import { EnumType } from '../runtime/type/enumType';
import { isNull } from '../utility/toolset';

export class EnumNode extends DataNode {
  override getValue() {
    const value = this._value;
    return isNull(value) ? null : (this.type as EnumType).type === EnumValueType.String ? `${value}` : parseInt(`${value}`);
  }
}
