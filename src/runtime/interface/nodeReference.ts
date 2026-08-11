import { NodeType } from '../type/nodeType';

/** The node reference interface */
export interface INodeReference {
  getRefTypes(): Generator<NodeType>;
}

/** The object implements the INodeReference */
export function hasNodeReferences(obj: unknown){
  return typeof (obj as any)?.getRefTypes === 'function'
}