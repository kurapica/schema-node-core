// =============================================================================
// IConstraintProperty — validation interface for constraint properties
// Mirrors C# SchemaNode.Core/Property/ConstraintProperty.cs
// =============================================================================

import { DataNode } from '../node/dataNode';
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
  validate(node: DataNode): Promise<boolean | undefined>;
}

/** Check if the property is constraint */
export function isConstraintProperty(prop: IProperty)
{
  return typeof (prop as any).validate === 'function'
}