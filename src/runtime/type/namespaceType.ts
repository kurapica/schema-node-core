// =============================================================================
// NamespaceType — runtime type for namespace schemas (schema tree nodes)
// =============================================================================

import { NodeType } from './nodeType';
import type { NodeSchema } from '../../schema/nodeSchema';

export class NamespaceType extends NodeType {
  /** Child types by name. */
  private _children = new Map<string, NodeType>();

  saveNodeType(name: string, type: NodeType): void {
    this._children.set(name, type);
  }

  getNodeType(name: string): NodeType | undefined {
    return this._children.get(name);
  }

  get children(): ReadonlyMap<string, NodeType> {
    return this._children;
  }
}
