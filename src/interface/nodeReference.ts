import type { INodeType } from "./nodeType";

/** The node reference interface */
export interface INodeReference {
  getRefTypes(): Generator<INodeType>;
}

/** The object implements the INodeReference */
export function hasNodeReferences(obj: unknown){
  return typeof (obj as any)?.getRefTypes === 'function'
}