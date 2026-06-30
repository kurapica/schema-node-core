// =============================================================================
// IProperty & Property<T> — core property value holder
// Mirrors C# SchemaNode.Core/Property/Property.cs
//
// NOTE: Does NOT import Stackable/Alias to avoid circular dependency.
//       resolveStackable() uses string-based lookup; resolveAlias() likewise.
// =============================================================================

/** Cache for property names derived from class names (PascalCase → camelCase). */
const _nameCache = new Map<Function, string>();

/** Cache for stackable flags — lazy from constructor metadata. */
const _stackableCache = new Map<Function, boolean>();

/** Cache for alias names. */
const _aliasCache = new Map<Function, string | undefined>();

function derivePropertyName(ctor: Function): string {
  let name = ctor.name;
  if (name.endsWith('Property')) name = name.slice(0, -8);
  if (name.length === 0) return name;
  return name[0].toLowerCase() + name.slice(1);
}

/** Read @Meta(Stackable) from constructor metadata — string-based, no circular import. */
function resolveStackable(ctor: Function): boolean {
  const META_KEY = Symbol.for('schema-node:meta');
  const entries = (ctor as unknown as Record<symbol, Array<{ property: IProperty }>>)[META_KEY];
  if (!entries) return false;
  for (const entry of entries) {
    if (entry.property.name === 'stackable') {
      return entry.property.getValue<boolean>() ?? false;
    }
  }
  return false;
}

/** Read @Meta(Alias) from constructor metadata — string-based, no circular import. */
function resolveAlias(ctor: Function): string | undefined {
  const META_KEY = Symbol.for('schema-node:meta');
  const entries = (ctor as unknown as Record<symbol, Array<{ property: IProperty }>>)[META_KEY];
  if (!entries) return undefined;
  for (const entry of entries) {
    if (entry.property.name === 'alias') {
      const raw = entry.property.getValue<string>();
      return raw === null || raw === undefined ? undefined : String(raw);
    }
  }
  return undefined;
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
      n = resolveAlias(ctor) ?? derivePropertyName(ctor);
      _nameCache.set(ctor, n);
    }
    return n;
  }

  get stackable(): boolean {
    const ctor = this.constructor as Function;
    let s = _stackableCache.get(ctor);
    if (s === undefined) {
      s = resolveStackable(ctor);
      _stackableCache.set(ctor, s);
    }
    return s;
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
