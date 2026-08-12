import type { IRelation } from "./valueAccess";

/** The relations provider */
export interface IRelationProvider {
    /** Gets the relation types */
    getRelations(): Generator<IRelation>;
}

/** Check if the object is a relation provider */
export function isRelationProvider(obj: unknown): obj is IRelationProvider {
    // for simple
  return typeof (obj as any).getRelations === 'function'
}