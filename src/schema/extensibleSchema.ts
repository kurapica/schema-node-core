// =============================================================================
// ExtensibleSchema — stores all properties (including schema-type ones) in extensions
// getProperty<T>() finds by property name → extensions lookup → deserializes into T
// getProperties<T>() handles stackable (array) values
// =============================================================================

import type { IProperty } from '../property/property';
import { getMetaProperty } from '../attribute/meta';
import { SchemaKindRecord } from '../property/record/schemaKind';

export abstract class ExtensibleSchema {
  /** The schema kind string, derived from @Meta(SchemaKind) on the subclass. */
  get schemaKind(): string | undefined {
    return getMetaProperty(this.constructor, SchemaKindRecord)?.getValue<string>();
  }

  /** Error status string. */
  error?: string;

  /** JSON extension data — stores ALL property values by property name. */
  extensions?: Record<string, unknown> | null;

  // ── getProperty<T>(propCtor) ──────────────────────────────────────────

  /**
   * Get a single property by its class constructor.
   * Derives the property name from the constructor, looks up in extensions, 
   * and wraps the raw value into a new property instance.
   */
  getProperty(propCtor: new () => IProperty): IProperty | undefined {
    const temp = new propCtor();
    const key = temp.name;
    const raw = this.extensions?.[key];
    if (raw === undefined) return undefined;
    temp.setValue(raw);
    return temp;
  }

  /**
   * Get all stacked properties by constructor.
   * For stackable properties, the extensions value is an array → each element
   * becomes its own property instance. For non-stackable, returns a single-item array.
   */
  getProperties(propCtor: new () => IProperty): IProperty[] {
    const temp = new propCtor();
    const key = temp.name;
    const raw = this.extensions?.[key];
    if (raw === undefined) return [];
    if (Array.isArray(raw)) {
      return raw.map((v) => {
        const p = new propCtor();
        p.setValue(v);
        return p;
      });
    }
    temp.setValue(raw);
    return [temp];
  }

  /**
   * Store a property into the extensions dictionary by its name.
   */
  setProperty(property: IProperty): void {
    if (!property.hasValue) return;
    this.extensions ??= {};
    this.extensions[property.name] = property.getValue();
  }

  // ── combineExtensions ──────────────────────────────────────────────────

  /**
   * Combine extensions from another ExtensibleSchema into this one.
   * JSON-like merge: same key overrides, arrays concatenated for stackable.
   */
  combineExtensions(other: ExtensibleSchema | undefined): void {
    if (!other?.extensions || Object.keys(other.extensions).length === 0) return;
    this.extensions ??= {};
    for (const [key, value] of Object.entries(other.extensions)) {
      const existing = this.extensions[key];
      if (existing === undefined) {
        this.extensions[key] = value;
      } else if (Array.isArray(existing) && Array.isArray(value)) {
        this.extensions[key] = [...existing, ...value];
      } else if (
        typeof existing === 'object' && existing !== null && !Array.isArray(existing) &&
        typeof value === 'object' && value !== null && !Array.isArray(value)
      ) {
        this.extensions[key] = { ...existing as Record<string, unknown>, ...value as Record<string, unknown> };
      } else {
        this.extensions[key] = value;
      }
    }
  }
}
