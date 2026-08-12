import type { IProperty } from "../interface/valueAccess";

/** Interface for type-reference property components. */
export interface ITypeRefProperty extends IProperty {
  /** Return the referenced type name for type-reference resolution. */
  getRefTypes(): Generator<string>;
}

/** Check if the property has ref type */
export function isTypeRefProperty(prop: IProperty): prop is ITypeRefProperty
{
  return typeof (prop as any).getRefTypes === 'function'
}
