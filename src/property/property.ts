// =============================================================================
// IProperty & Property<T> — core property value holder
// Mirrors C# SchemaNode.Core/Property/Property.cs
//
// NOTE: Does NOT import Stackable/Alias to avoid circular dependency.
//       resolveStackable() uses string-based lookup; resolveAlias() likewise.
// =============================================================================

/** Cache for property names derived from class names (PascalCase → camelCase). */
const _nameCache = new Map<Function, string>();

function derivePropertyName(ctor: Function): string {
  let name = ctor.name;
  if (name.endsWith('Property')) name = name.slice(0, -8);
  if (name.length === 0) return name;
  return name[0].toLowerCase() + name.slice(1);
}

/**
 * Base interface for all property instances attached to a schema.
 */
export interface IProperty {
  /** Canonical property name, e.g. "upLimit", "require", "forSchema". */
  readonly name: string;

  /** Whether duplicates from different sources stack (accumulate) vs override. */
  readonly stackable: boolean;

  /** Whether the property carries a non-empty value. */
  readonly hasValue: boolean;

  /** The TypeScript constructor used as a type token (≈ C# Type). */
  readonly type: Function;

  /** Set the raw value onto this property instance. */
  setValue<T>(value: T): void;

  /** Get the typed value. If matchType is true, returns undefined on type mismatch. */
  getValue<T>(matchType?: boolean): T | undefined;

  /** Apply the property to the target, or register the target */
  apply(target: object, field?: string | symbol): void;
}

/**
 * Abstract base for typed property value holders.
 * @typeParam T — The value type of this property.
 */
export abstract class Property<T> implements IProperty {
  protected _value: T | undefined = undefined;
  protected _hasValue = false;

  get name(): string {
    const ctor = this.constructor as Function;
    let n = _nameCache.get(ctor);
    if (!n) {
      n = (ctor as unknown as Record<string, string>).alias ?? derivePropertyName(ctor);
      _nameCache.set(ctor, n);
    }
    return n;
  }

  get stackable(): boolean {
    const ctor = this.constructor as Function;
    return (ctor as unknown as Record<string, boolean>).stackable ?? false;
  }

  get hasValue(): boolean {
    return this._hasValue;
  }

  get type(): Function {
    return this.constructor;
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

  // do nothing by default, subclasses can override to apply the property to the target
  apply(target: object, field?: string | symbol): void {}
}
