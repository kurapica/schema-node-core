// =============================================================================
// IPropertyOwner — interface for objects that hold multiple properties
// Mirrors C# SchemaNode.Core/Property/PropertyOwner.cs
// =============================================================================

import type { IProperty } from './property';

/**
 * Interface for any object that can own and serve properties.
 * Schemas and DataNodes implement this.
 */
export interface IPropertyOwner {
  /** Get a single property by its class constructor (non-stackable). */
  getProperty(propCtor: new () => IProperty): IProperty | undefined;

  /** Get all properties by their class constructor (for stackable). */
  getProperties(propCtor: new () => IProperty): IProperty[];

  /** Store a property on this owner. */
  setProperty(property: IProperty): void;
}

/**
 * Typed convenience helpers working on any IPropertyOwner.
 */
export function getPropertyTyped<T extends IProperty>(
  owner: IPropertyOwner,
  ctor: new () => T,
): T | undefined {
  return owner.getProperty(ctor) as T | undefined;
}

export function getPropertiesTyped<T extends IProperty>(
  owner: IPropertyOwner,
  ctor: new () => T,
): T[] {
  return owner.getProperties(ctor) as T[];
}

/**
 * Set a property on an owner using its constructor to create the instance.
 */
export function setPropertyTyped<T extends IProperty, V>(
  owner: IPropertyOwner,
  ctor: new () => T,
  value: V,
): void {
  const prop = new ctor();
  prop.setValue(value);
  owner.setProperty(prop);
}

/**
 * Get properties for a list of constructors, in order.
 * Non-stackable: first value wins. Stackable: accumulated.
 * Mirrors C# PropertyOwnerExtensions.GetProperties(IEnumerable<Type>).
 */
export function getPropertiesOrdered(
  owner: IPropertyOwner,
  ctors: (new () => IProperty)[],
): IProperty[] {
  const seen = new Set<Function>();
  const result: IProperty[] = [];

  for (const ctor of ctors) {
    for (const prop of owner.getProperties(ctor)) {
      if (!prop.hasValue) continue;
      if (prop.stackable) {
        result.push(prop);
      } else if (!seen.has(prop.constructor)) {
        seen.add(prop.constructor);
        result.push(prop);
      }
    }
  }
  return result;
}
