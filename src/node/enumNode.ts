// =============================================================================
// EnumNode — enum value node with cascading support
// Mirrors C# SchemaNode.Core/Node/EnumNode.cs
// =============================================================================

import { DataNode } from './dataNode';
import { EnumValueType, type EnumValueTypeValue } from '../enum/enumValueType';
import { IValueAccess } from '../runtime/interfaces';
import { EnumType } from '../runtime/type';

export class EnumNode extends DataNode {
  private _strValue: string | undefined;
  private _longValue: number | undefined;
  private readonly _isString: boolean;

  // #region ── ctor & dtor ───────────────────────────────────────────────────

  /** Construct the data node with value type, parent and init value */
  constructor(type: EnumType, value: unknown, parent: IValueAccess | undefined = undefined) {
    super(type, value, parent);
    this._isString = type.type === EnumValueType.String;
  }

  // #endregion
  
  /** The enum storage type. */
  get valueType(): EnumValueTypeValue { return this._isString ? EnumValueType.String : EnumValueType.Int; }

  get isEmpty(): boolean {
    return this._isString ? !this._strValue || this._strValue.trim() === '' : this._longValue === undefined;
  }

  trySetValue<T>(value: T): boolean {
    if (this._isString) {
      if (typeof value === 'string') { this._strValue = value; return true; }
      return false;
    }
    if (typeof value === 'number') { this._longValue = value; return true; }
    return false;
  }

  tryGetValue<T>(): T | undefined {
    return (this._isString ? this._strValue : this._longValue) as unknown as T;
  }

  clone(): DataNode {
    const copy = new EnumNode(this.type);
    copy._strValue = this._strValue;
    copy._longValue = this._longValue;
    return copy;
  }
}
