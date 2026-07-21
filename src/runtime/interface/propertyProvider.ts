import { IProperty } from "../../property";

/** Provider the properties */
export interface IPropertyProvider {
  /** Gets the property */
  getProperty<T extends IProperty>(propCtor: new() => T): T | undefined;

  /** Gets the properties */
  getProperties<T extends IProperty>(propCtor: new() => T): Generator<T>;
}

export function *joinProperties<T extends IProperty>(...propertyProviders: (Generator<T> | T[] | undefined)[]): Generator<T> {
  const types: Set<Function> = new Set();
  for (const propertyProvider of propertyProviders) {
    if (!propertyProvider) continue;
    for (const prop of propertyProvider)
    {
      if (prop.stackable) 
        yield prop;
      else
      {
        const type = prop.constructor;
        if (types.has(type)) continue;
        types.add(type);
        yield prop;
      }
    }
  }
}