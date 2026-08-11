import { RelationType } from '../type/relationType';

/** The relations provider */
export interface IRelationProvider {
    /** Gets the relation types */
    getRelations(): Generator<RelationType>;
}

/** Check if the object is a relation provider */
export function isRelationProvider(obj: unknown): obj is IRelationProvider {
    // for simple
  return typeof (obj as any).getRelations === 'function'
}