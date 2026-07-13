// =============================================================================
// IProperty & Property<T> — core property value holder
// Mirrors C# SchemaNode.Core/Property/Property.cs
//
// NOTE: Does NOT import Stackable/Alias to avoid circular dependency.
//       resolveStackable() uses string-based lookup; resolveAlias() likewise.
// =============================================================================

import { getPropertyForSchemas } from "../runtime/schemaRuntime";

/** Cache for property names derived from class names (PascalCase → camelCase). */
const _nameCache = new Map<Function, string>();
const _saveableCache = new Map<Function, boolean>();

/**
 * Base interface for all property instances attached to a schema.
 */
export interface IProperty {
  /** Canonical property name, e.g. "upLimit", "require", "forSchema". */
  readonly name: string;

  /** Whether duplicates from different sources stack (accumulate) vs override. */
  readonly stackable: boolean;

  /** Whether the property is static, which means the property value cannot be modified by relation system. */
  readonly static: boolean;

  /** Whether the property carries a non-empty value. */
  readonly hasValue: boolean;

  /** Whether the property value is savable (persisted) in schema. */
  readonly savable: boolean;

  /** Set the raw value onto this property instance. */
  setValue<T>(value: T): void;

  /** Get the typed value. If matchType is true, returns undefined on type mismatch. */
  getValue<T>(matchType?: boolean): T | undefined;

  /** Combine the value of another property into this one. */
  combine(other: IProperty): boolean;

  /** Compare this property to another for equality, used for stackable properties. */
  equal(other: IProperty): boolean;

  /** Apply the property to the target, or register the target */
  apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void;
}

/**
 * Abstract base for typed property value holders.
 * @typeParam T — The value type of this property.
 */
export abstract class Property<T> implements IProperty {
  protected _value: T | undefined = undefined;
  protected _hasValue = false;

  get name(): string {
    return getPropertyName(this.constructor as new () => IProperty);
  }

  get stackable(): boolean {
    const ctor = this.constructor as Function;
    return (ctor as unknown as Record<string, boolean>).stackable ?? false;
  }

  get static(): boolean {
    const ctor = this.constructor as Function;
    return (ctor as unknown as Record<string, boolean>).static ?? false;
  }

  get savable(): boolean {
    const ctor = this.constructor as Function;
    if (_saveableCache.has(ctor)) return _saveableCache.get(ctor)!;
    const savable = getPropertyForSchemas(this.constructor as new () => IProperty).length > 0;
    _saveableCache.set(ctor, savable);
    return savable;
  }

  get hasValue(): boolean {
    return this._hasValue;
  }

  /** Override in subclasses for custom coercion. */
  setValue<TValue>(value: TValue): void {
    this._value = value as unknown as T;
    this._hasValue = value !== undefined && value !== null;
  }

  getValue<TV>(matchType?: boolean): TV | undefined {
    if (!this._hasValue) return undefined;
    return this._value as unknown as TV;
  }

  combine(other: IProperty): boolean {
    if (this.constructor !== other.constructor) return false;
    if (this.hasValue || !other.hasValue) return false;
    this.setValue(other.getValue());
    return true;
  }

  equal(other: IProperty): boolean {
    if (this.constructor !== other.constructor) return false;
    if (this.hasValue !== other.hasValue) return false;
    return !this.hasValue || this.getValue() === other.getValue();
  }

  // do nothing by default, subclasses can override to apply the property to the target
  apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {}
}

export interface ITypeRefProperty extends IProperty {
  /** Return the referenced type name for type-reference resolution. */
  getRefTypes(): Generator<string>;
}

/** Check if the property has ref type */
export function isTypeRefProperty(prop: IProperty)
{
  return typeof (prop as any).getRefTypes === 'function'
}

/** Get the property name of the property constructor. */
export function getPropertyName(ctor: new () => IProperty): string {
  let n = _nameCache.get(ctor);
  if (!n) {
    n = (ctor as unknown as Record<string, string>).alias;
    if (!n)
    {
      let name = ctor.name;
      if (name.endsWith('Property')) name = name.slice(0, -8);
      if (name.length === 0) return name;
      n = name[0].toLowerCase() + name.slice(1);
    }
    _nameCache.set(ctor, n);
  }
  return n;
}