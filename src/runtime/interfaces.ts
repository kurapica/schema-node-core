// =============================================================================
// IRuntime Interfaces — shared interfaces used across Node/Runtime layers
// =============================================================================

import type { DataNode } from '../node/dataNode';

/** Objects that provide path-based value access. */
export interface IValueAccess {
  getAccessValue(path: string): DataNode | undefined;
}
