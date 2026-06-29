// =============================================================================
// EnumNode — enum value node with cascading support
// Mirrors C# SchemaNode.Core/Node/EnumNode.cs
// =============================================================================

import { DataNode } from './dataNode';
import type { NodeSchema } from '../schema/nodeSchema';
import { EnumValueType, type EnumValueTypeValue } from '../enum/enumValueType';

export class EnumNode extends DataNode {
  private _value: string | string[] | undefined;

  /** The enum storage type. */
  valueType: EnumValueTypeValue = EnumValueType.String;

  get isEmpty(): boolean {
    return this._value === undefined;
  }

  trySetValue<T>(value: T): boolean {
    if (typeof value === 'string') {
      this._value = value;
      return true;
    }
    if (Array.isArray(value) && this.valueType === EnumValueType.Flags) {
      this._value = value as string[];
      return true;
    }
    return false;
  }

  tryGetValue<T>(): T | undefined {
    return this._value as unknown as T;
  }

  /** Whether multiple selections are allowed. */
  get multiple(): boolean {
    return this.valueType === EnumValueType.Flags;
  }

  /** Get selected value(s). */
  get selected(): string | string[] | undefined {
    return this._value;
  }
}
