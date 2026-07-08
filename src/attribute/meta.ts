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
import { isSchemaKindProperty } from '../runtime/schemaRuntime';
import { isEmpty, isNull } from '../utility/toolset';

const META_KEY = Symbol('schema-node:meta');

interface MetaEntry {
  property: IProperty;
  _memberKey?: string | symbol; 
  _func?: Function;
  _paramIndex?: number; 
  _paramKey?: string | symbol 
}

/** Resolve the canonical constructor for storing metadata. */
function getConstructor(target: object): Function {
  return typeof target === 'function' ? target : target.constructor;
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

    if (!isEmpty(value)) {
      prop.setValue(value);
    } else {
      // Check if propCtor has @Meta(Default) on itself
      const defaultProp = getMetaProperty(propCtor, Default) as Default | undefined;
      if (defaultProp?.hasValue) {
        prop.setValue(defaultProp.getValue());
      }
    }
    if (prop.hasValue === false) return; // Don't store empty metadata

    const ctor = getConstructor(target);
    const metaProp = prop as IProperty;
    const entry : MetaEntry = { property: metaProp };

    if (typeof descriptorOrIndex === 'number') {
      // Parameter decorator
      entry._paramIndex = descriptorOrIndex;
      entry._paramKey = _propertyKey;
      if (_propertyKey !== undefined) entry._memberKey = _propertyKey;
    } 
    else if (_propertyKey !== undefined) {
      // Field/method decorator
      entry._memberKey = _propertyKey;

      // Record the function
      if (descriptorOrIndex)
        entry._func = descriptorOrIndex.value as Function;
    }

    ensureConstructorStore(ctor).push(entry);
    metaProp.apply(target, _propertyKey, descriptorOrIndex);
  }) as ClassDecorator & PropertyDecorator & ParameterDecorator & MethodDecorator;
}

// ── Retrieval ──────────────────────────────────────────────────────────────

function getMetaEntriesRaw(ctor: Function): MetaEntry[] {
  return (ctor as unknown as Record<symbol, MetaEntry[]>)[META_KEY] ?? [];
}

/** Gets the fields declared with meta attributes */
export function getMetaFields(ctor: Function) : string[]
{
  const fields : string[] = []
  for (const entry of getMetaEntriesRaw(ctor))
  {
    if (entry._memberKey && typeof entry._memberKey === 'string' && !entry._paramKey && !entry._func && !fields.includes(entry._memberKey))
      fields.push(entry._memberKey);
  }
  return fields;
}

/** Gets the methods declared with meta attributes */
export function getMetaMethods(ctor: Function) : string[]
{
  const methods : string[] = []
  for (const entry of getMetaEntriesRaw(ctor))
  {
    if (entry._memberKey && typeof entry._memberKey === 'string' && !entry._paramKey && entry._func && !methods.includes(entry._memberKey))
      methods.push(entry._memberKey);
  }
  return methods;
}

/** Get the first Meta property of type T, optionally scoped to a field. */
export function getMetaProperty<T extends IProperty>(
  ctor: Function,
  propCtor: new () => T,
  field?: string | symbol,
  index?: number
): T | undefined {
  for (const entry of getMetaEntriesRaw(ctor)) {
    if (field ? entry._memberKey != field : entry._memberKey) continue;
    if (!isNull(index) ? entry._paramIndex != index : !isNull(entry._paramIndex)) continue;

    const p = entry.property;
    if (!(p instanceof propCtor)) continue;
    return p as unknown as T;
  }
  return undefined;
}

/**
 * Get all Meta properties of type T from a constructor, optionally scoped to a field.
 * @param ctor   The constructor (class)
 * @param propCtor The property type to filter
 * @param field  Optional field/method name to scope to
 */
export function getMetaProperties<T extends IProperty>(
  ctor: Function,
  propCtor?: new () => T,
  field?: string | symbol,
  index?: number
): T[] {
  const results: T[] = [];
  for (const entry of getMetaEntriesRaw(ctor)) {
    if (field ? entry._memberKey != field : entry._memberKey) continue;
    if (!isNull(index) ? entry._paramIndex != index : !isNull(entry._paramIndex)) continue;

    const p = entry.property;
    if (propCtor != null && !(p instanceof propCtor)) continue;
    results.push(p as unknown as T);
  }
  return results;
}

/**
 * Get Meta properties filtered by ForSchema kind. 
 */
export function getMetaPropertiesForSchema<T extends IProperty>(
  kind: string,
  ctor: Function,
  propCtor?: new () => T,
  field?: string | symbol,
  index?: number
): T[] {
  return getMetaProperties(ctor, propCtor, field, index)
    .filter((p) => isSchemaKindProperty(kind, p.constructor as unknown as new () => IProperty));
}

/**
 * Get parameter type info for a method: returns an array of { index, type } sorted by parameter position.
 * Each parameter must have @Meta(SchemaType, 'typeName') to be included.
 */
export function getMetaParameters<T extends IProperty>(
  ctor: Function,
  methodName: string
): { index: number; property: IProperty; value: unknown }[] {
  const results: { index: number; property: IProperty; value: unknown }[] = [];
  for (const entry of getMetaEntriesRaw(ctor)) {
    if (entry._memberKey !== methodName || entry._paramIndex === undefined) continue;
    const p = entry.property;
    results.push({ index: entry._paramIndex, property: p as IProperty, value: p.hasValue ? p.getValue() : undefined });
  }
  // Deduplicate by index (keep first occurrence)
  const seen = new Set<number>();
  return results.filter(r => {
    if (seen.has(r.index)) return false;
    seen.add(r.index);
    return true;
  }).sort((a, b) => a.index - b.index);
}
