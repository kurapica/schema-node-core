// =============================================================================
// IPropertyOwner — interface for objects that hold multiple properties
// Mirrors C# SchemaNode.Core/Property/PropertyOwner.cs
// =============================================================================

import { getSchemaKindPropertyTypes } from '../runtime/schemaRuntime';
import { isNull } from '../utility/toolset';
import type { IProperty, PropertyCtor } from '../interface/valueAccess';
import { getPropertyName } from './property';

/**
 * Get a single property by its class constructor.
 * Derives the property name from the constructor, looks up in extensions, 
 * and wraps the raw value into a new property instance.
 */
export function getProperty(owner: any, propCtor: PropertyCtor): IProperty | undefined {
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

/** Gets the property value from the owner */
export function getPropertyValue<T>(owner: any, propCtor: PropertyCtor | string): T | undefined {
  if (typeof propCtor === 'string') return owner[propCtor] as T; // for simple now
  return getProperty(owner, propCtor)?.getValue<T>();
}

/** Get all properties with given property types. */
export function *getProperties(owner: any, propCtor: PropertyCtor): Generator<IProperty> {
  if (owner === null) return;  

  const key = getPropertyName(propCtor);
  const raw = key ? owner?.[key] : undefined;
  if (isNull(raw)) return;

  const temp = new propCtor();
  if (temp.stackable && Array.isArray(raw)) {
    for (let v of raw){
      const p = new propCtor();
      p.setValue(v);
      yield p; 
    }
  }
  else
  {
    temp.setValue(raw);
    yield temp;
  }
}

/** Gets all propreties with the given schema kind. */
export function *getPropertiesBySchemaKind(owner: any, kind: string): Generator<IProperty> {
  for (let propCtor of getSchemaKindPropertyTypes(kind))
    for (let prop of getProperties(owner, propCtor))
      yield prop;
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
export function setPropertyValue(owner: any, propCtor: PropertyCtor, value: unknown): any {
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

  for (const propCtor of getSchemaKindPropertyTypes(kind)) {
    const otherProps = Array.from(getProperties(other, propCtor));
    if (otherProps.length === 0) continue;

    const selfProps = Array.from(getProperties(owner, propCtor));
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
        const selfProp = selfProps[0];
        if (selfProp.combine(otherProp)) {
          owner[selfProp.name] = selfProp.getValue();
        }
      }
    }
  }
  
  return owner;
}