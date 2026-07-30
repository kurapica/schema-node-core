// =============================================================================
// IConstraintProperty — validation interface for constraint properties
// Mirrors C# SchemaNode.Core/Property/ConstraintProperty.cs
// =============================================================================

import { IValueAccess } from '../runtime/interfaces';
import type { IProperty } from './property';

/**
 * Interface for constraint property components.
 * Each method returns:
 *   true  = valid
 *   false = invalid
 *   undefined/null = not applicable to this node type
 */
export interface IConstraintProperty extends IProperty {
  /** validate the data node */
  validate(node: IValueAccess): Promise<boolean | undefined>;

  /** The error message if the property is invalid. */
  error(node: IValueAccess): string | undefined;
}

/** Check if the property is constraint */
export function isConstraintProperty(prop: IProperty): prop is IConstraintProperty {
    // for simple
  return typeof (prop as any).validate === 'function'
}