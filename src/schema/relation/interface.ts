import { IValueAccess } from "../../runtime/interface/valueAccess";
import { RelationType } from "../../runtime/type/relationType";
import { RelationSchema } from "./type";

/** The handler to process the relations */
export interface IRelationProcess {
  /** load relation kind data from relation schema */
  load(schema: RelationSchema): Promise<void>;

  /** Attach the relation to the target */
  attach(relation: RelationType, owner: IValueAccess, target: IValueAccess): void;

  /** Detach the relation from the target */
  detach(relation: RelationType, owner: IValueAccess, target: IValueAccess): void;

  /** Execute the relation process and return the reuslt value */
  process(owner: IValueAccess, target: IValueAccess) : Promise<unknown>;
}