// =============================================================================
// IPropertyOwner — interface for objects that hold multiple properties
// Mirrors C# SchemaNode.Core/Property/PropertyOwner.cs
// =============================================================================

import { getSchemaKindProperties } from '../runtime/schemaRuntime';
import { isNull } from '../utility/toolset';
import { getPropertyName, type IProperty } from './property';

/**
 * Get a single property by its class constructor.
 * Derives the property name from the constructor, looks up in extensions, 
 * and wraps the raw value into a new property instance.
 */
export function getProperty(owner: any, propCtor: new () => IProperty): IProperty | undefined {
  const key = getPropertyName(propCtor);
  const raw = key ? owner?.[key] : undefined;
  if (isNull(raw)) return undefined;

  const temp = new propCtor();
  if (temp.stackable && Array.isArray(raw)) {
    // For stackable properties, we can return the first value as a single property instance.
    if (raw.length === 0) return undefined;
    temp.setValue(raw[0]);
  } else {
    temp.setValue(raw);
  }
  return temp;
}

/**
 * Get all properties with given property types.
 */
export function getProperties(owner: any, ...propCtors: (new () => IProperty)[]): IProperty[] {
  if (owner === null) return [];
  
  const seen = new Set<Function>();
  const result: IProperty[] = [];

  for (const ctor of propCtors) {
    if (seen.has(ctor)) continue; // Avoid duplicates
    seen.add(ctor);

    const key = getPropertyName(ctor);
    const raw = key ? owner?.[key] : undefined;
    if (isNull(raw)) continue;

    const temp = new ctor();
    if (temp.stackable && Array.isArray(raw)) {
      raw.map((v) => {
        const p = new ctor();
        p.setValue(v);
        result.push(p);
      });
    }
    else
    {
      temp.setValue(raw);
      result.push(temp);
    }
  }
  return result;
}

/**
 * Store a property into the extensions dictionary by its name.
 */
export function setProperty(owner: any, property: IProperty): any {
  if (!owner || !property.hasValue) return owner;
  if (property.stackable && !isNull(owner[property.name])) {
    const existing = owner[property.name];
    if (Array.isArray(existing)) {
      existing.push(property.getValue());
    } else {
      owner[property.name] = [existing, property.getValue()];
    }
  }
  else
  {
    owner[property.name] = property.getValue();
  }
  return owner;
}

/** Sets the value of a property */
export function setPropertyValue(owner: any, propCtor: new () => IProperty, value: unknown): any {
  const prop = new propCtor();
  prop.setValue(value);
  return setProperty(owner, prop);
}

/**
 * Combine properties from another property owner into this one, optionally filtering by schema kind.
 * This function merges the properties of the `other` owner into the `owner`, respecting stackable properties and schema kind filtering.
 * @param owner The property owner
 * @param other The other property owner
 * @param kind The schema kind
 */
export function combineProperties(owner: any, other: any | undefined, kind: string): any {
  if (!kind || !other) return owner;

  for (const propCtor of getSchemaKindProperties(kind)) {
    const otherProps = getProperties(other, propCtor);
    if (otherProps.length === 0) continue;

    const selfProps = getProperties(owner, propCtor);
    const otherProp = otherProps[0];
    if (otherProp.stackable) {
      if (selfProps.length === 0) {
        owner[otherProp.name] = otherProps.map((p) => p.getValue());
      }
      else
      {
        const len = selfProps.length;
        for (const p of otherProps) {
          if (!selfProps.find((sp) => sp.equal(p))) 
            selfProps.push(p);
        }
        if (selfProps.length > len)
          owner[otherProp.name] = selfProps.map((p) => p.getValue());
      }
    }
    else
    {
      if (selfProps.length === 0) {
        owner[otherProp.name] = otherProp.getValue();
      }
      else
      {
        // combine the values of the two properties
        const selfProp = selfProps[0];
        selfProp.combine(otherProp);
        owner[selfProp.name] = selfProp.getValue();
      }
    }
  }
  
  return owner;
}