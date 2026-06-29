// =============================================================================
// @Meta decorator — core attribute system, stores IProperty instances on types
// Mirrors C# SchemaNode.Core/Attribute/MetaAttribute.cs
//
// All metadata lives on the constructor. Field/method/param metadata is keyed
// by _memberKey (field/method name) and _paramIndex (parameter position).
// Query supports optional field filter and prototype-chain inheritance.
// =============================================================================

import type { IProperty } from '../property/property';
import { Default } from '../property/common/default';

const META_KEY = Symbol('schema-node:meta');

interface MetaEntry {
  property: IProperty;
}

/** Resolve the canonical constructor for storing metadata. */
function getConstructor(target: object): Function {
  if (typeof target === 'function') return target;
  return target.constructor;
}

function ensureConstructorStore(ctor: Function): MetaEntry[] {
  const rec = ctor as unknown as Record<symbol, MetaEntry[]>;
  let store = rec[META_KEY];
  if (!store) {
    store = [];
    rec[META_KEY] = store;
  }
  return store;
}

/**
 * @Meta decorator factory.
 *
 * Usage:
 *   @Meta(Require, true)              — class-level
 *   @Meta(SchemaType, "system.string") — field-level
 *   @Meta(SchemaType, "T")            — parameter-level
 *   @Meta(Stackable, true)            — on Property subclass (read by Property system)
 */
export function Meta(
  propCtor: new () => IProperty,
  value?: unknown,
): ClassDecorator & PropertyDecorator & ParameterDecorator & MethodDecorator {
  return ((target: object, _propertyKey?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>) => {
    const prop = new propCtor();

    if (value !== undefined) {
      prop.setValue(value);
    } else {
      // Check if propCtor has @Meta(Default) on itself
      const entries = getMetaEntriesRaw(propCtor);
      for (const e of entries) {
        if (e.property instanceof Default && e.property.hasValue) {
          prop.setValue(e.property.getValue());
          break;
        }
      }
    }
    if (prop.hasValue === false) return; // Don't store empty metadata

    const ctor = getConstructor(target);
    const metaProp = prop as IProperty & { _memberKey?: string | symbol; _paramIndex?: number; _paramKey?: string | symbol };

    if (typeof descriptorOrIndex === 'number') {
      // Parameter decorator
      metaProp._paramIndex = descriptorOrIndex;
      metaProp._paramKey = _propertyKey;
      if (_propertyKey !== undefined) metaProp._memberKey = _propertyKey;
    } else if (_propertyKey !== undefined) {
      // Field/method decorator
      metaProp._memberKey = _propertyKey;
    }

    ensureConstructorStore(ctor).push({ property: metaProp });
  }) as ClassDecorator & PropertyDecorator & ParameterDecorator & MethodDecorator;
}

// ── Retrieval ──────────────────────────────────────────────────────────────

function getMetaEntriesRaw(ctor: Function): MetaEntry[] {
  return (ctor as unknown as Record<symbol, MetaEntry[]>)[META_KEY] ?? [];
}

/**
 * Walk the prototype chain: [ctor, ctor.prototype, Object.getPrototypeOf(ctor), ...]
 * collecting all Meta entries.
 */
function* walkChain(ctor: Function): Generator<MetaEntry> {
  const seen = new Set<Function>();
  let current: Function | null = ctor;
  while (current && !seen.has(current)) {
    seen.add(current);
    for (const e of getMetaEntriesRaw(current)) yield e;
    // Also check prototype for instance-level metadata
    const proto = (current as { prototype?: object }).prototype;
    if (proto && proto !== current && !seen.has(proto as Function)) {
      seen.add(proto as Function);
      for (const e of getMetaEntriesRaw(proto as Function)) yield e;
    }
    current = Object.getPrototypeOf(current);
  }
}

/**
 * Get all Meta properties of type T from a constructor, optionally scoped to a field.
 * Walks the prototype chain (inheritance support).
 * @param ctor   The constructor (class)
 * @param propCtor The property type to filter
 * @param field  Optional field/method name to scope to
 */
export function getMetaProperties<T extends IProperty>(
  ctor: Function,
  propCtor: new () => T,
  field?: string | symbol,
): T[] {
  const results: T[] = [];
  for (const entry of walkChain(ctor)) {
    const p = entry.property;
    if (!(p instanceof propCtor)) continue;
    if (field !== undefined) {
      const mp = p as IProperty & { _memberKey?: string | symbol };
      if (mp._memberKey !== field) continue;
    }
    results.push(p as unknown as T);
  }
  return results;
}

/**
 * Get the first Meta property of type T, optionally scoped to a field.
 */
export function getMetaProperty<T extends IProperty>(
  ctor: Function,
  propCtor: new () => T,
  field?: string | symbol,
): T | undefined {
  for (const entry of walkChain(ctor)) {
    const p = entry.property;
    if (!(p instanceof propCtor)) continue;
    if (field !== undefined) {
      const mp = p as IProperty & { _memberKey?: string | symbol };
      if (mp._memberKey !== field) continue;
    }
    return p as unknown as T;
  }
  return undefined;
}

/**
 * Get Meta properties filtered by ForSchema kind.
 */
export function getMetaPropertiesForSchema<T extends IProperty>(
  ctor: Function,
  propCtor: new () => T,
  kind: string,
): T[] {
  return getMetaProperties(ctor, propCtor).filter((p) => {
    // Check if the property's own class has @Meta(ForSchema, [kind])
    const pCtor = p.constructor as Function;
    const forSchema = getMetaProperty(pCtor, ForSchema) as ForSchema | undefined;
    if (!forSchema?.hasValue) return false;
    const kinds = forSchema.getValue<string[]>();
    return kinds?.includes(kind) ?? false;
  });
}

import { ForSchema } from '../property/core/forSchema';
