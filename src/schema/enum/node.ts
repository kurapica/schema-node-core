// =============================================================================
// EnumNode — enum value node with cascading support
// Mirrors C# SchemaNode.Core/Node/EnumNode.cs
// =============================================================================

import { EnumValueType } from "../../enum/enumValueType/type";
import { joinProperties, type IProperty, type IPropertyProvider, type IValueAccess, type PropertyCtor } from "../../interface";
import { isNull, trimValue } from "../../utility/toolset";
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
      super(type, value, parent, new EnumArrayNodePropertyProvider(type.element as EnumType, propProvider));
      this.enumType = type.element as EnumType;
  }

  override getValue(): unknown[] {
    const value = this.rawValue as unknown[];
    if (!Array.isArray(value)) return [];
    return trimValue([...value]).map((item: any) => this.enumType.type === EnumValueType.String ? `${item}` : parseInt(`${item}`));
  }

  get length() {
    return (this.rawValue as unknown[]).length;
  }
}

class EnumArrayNodePropertyProvider implements IPropertyProvider {
  private _enumType: EnumType;
  private _propProvider?: IPropertyProvider;

  constructor(enumType: EnumType, propProvider?: IPropertyProvider) {
    this._enumType = enumType;
    this._propProvider = propProvider;
  }

  getProperty<T extends IProperty>(propCtor: PropertyCtor | string): T | undefined {
    return this._propProvider?.getProperty(propCtor) as T ?? this._enumType.getProperty(propCtor) as T;
  }
  
  getPropertyValue<T>(propCtor: PropertyCtor | string): T | undefined {
    return this.getProperty(propCtor)?.getValue<T>();
  }

  *getProperties<T extends IProperty>(propCtor: PropertyCtor | string): Generator<T> {
    for (let prop of joinProperties(this._propProvider?.getProperties(propCtor) || [], this._enumType.getProperties(propCtor))) yield prop as T;
  }

  *getPropertyValues<T>(propCtor: PropertyCtor | string): Generator<T> {
    for (let prop of this.getProperties(propCtor)) yield prop.getValue<T>()!;
  }

  *filterProperties(predicate: (prop: IProperty) => boolean): Generator<IProperty> {
    for (let prop of joinProperties(this._propProvider?.filterProperties(predicate), this._enumType.filterProperties(predicate))) yield prop;
  }
}