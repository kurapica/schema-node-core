import { RelationType } from "../type";

/** The relations provider */
export interface IRelationProvider {
    /** Gets the relation types */
    getRelations(): Generator<RelationType>;
}