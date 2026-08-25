// =============================================================================
// IProperty & Property<T> — core property value holder
// Mirrors C# SchemaNode.Core/Property/Property.cs
//
// NOTE: Does NOT import Stackable/Alias to avoid circular dependency.
//       resolveStackable() uses string-based lookup; resolveAlias() likewise.
// =============================================================================
;
import { getPropertyTypeSupportSchemas } from "../runtime/schemaRuntime";

import type { IValueAccess, IProperty, PropertyCtor } from "../interface";
import { deepClone, trimValue } from "../utility/toolset";

/** Cache for property names derived from class names (PascalCase → camelCase). */
const _nameCache = new Map<Function, string>();
const _saveableCache = new Map<Function, boolean>();

/**
 * Abstract base for typed property value holders.
 * @typeParam T — The value type of this property.
 */
export abstract class Property<T> implements IProperty {
  protected _value: T | undefined = undefined;
  protected _hasValue = false;

  constructor(source?: IValueAccess) {
    this.source = source;
  }

  get name(): string {
    return getPropertyName(this.constructor as PropertyCtor);
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
    const savable = getPropertyTypeSupportSchemas(this.constructor as PropertyCtor).length > 0;
    _saveableCache.set(ctor, savable);
    return savable;
  }

  get hasValue(): boolean {
    return this._hasValue;
  }

  /** The source of the property value. */
  readonly source?: IValueAccess;

  /** Whether the property is applicable to the given schema kind. */
  forSchema(...kinds: string[]): boolean {
    const ctor = this.constructor as Function;
    return ((ctor as unknown as Record<string, string[]>).forSchema as string[])?.some((k) => kinds.includes(k)) ?? false;
  }

  /** Override in subclasses for custom coercion. */
  setValue<TValue>(value: TValue): void {
    this._value = value as unknown as T;
    this._hasValue = value !== undefined && value !== null;
  }

  getValue<TV>(): TV | undefined {
    if (!this._hasValue) return undefined;
    return trimValue(deepClone(this._value)) as unknown as TV;
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

  /** Apply the property effect to the target. */
  effect(target: IValueAccess, newValue?: unknown, oldValue?: unknown, source?: IValueAccess): void {}
}

/** Get the property name of the property constructor. */
export function getPropertyName(ctor: PropertyCtor): string {
  let n = _nameCache.get(ctor);
  if (!n) {
    n = (ctor as unknown as Record<string, string>).alias;
    if (!n)
    {
      let name = ctor.name ?? '';
      if (name.endsWith('Property')) name = name.slice(0, -8);
      if (name.length === 0) return name;
      n = name[0].toLowerCase() + name.slice(1);
    }
    _nameCache.set(ctor, n);
  }
  return n;
}