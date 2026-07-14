// =============================================================================
// IRuntime Interfaces — shared interfaces used across Node/Runtime layers
// =============================================================================

import type { DataNode } from '../node/dataNode';
import { NodeType, ValueType } from './type';

/** The node reference interface */
export interface INodeReference {
  getRefTypes(): Generator<NodeType>;
}

/** The node error interface */
export interface IErrorProvider {
  error?: string;
}

/** The value type access interface */
export interface IValueTypeAccess {
  /** Gets the access value type */
  getAccessValueType(path: string): ValueType | undefined;
}

/** Objects that provide path-based value access. */
export interface IValueAccess {
  getAccessValue(path: string): DataNode | undefined;
}
