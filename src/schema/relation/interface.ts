import type { IRelation, IValueAccess } from "../../interface";
import type { RelationSchema } from "./type";

/** The handler to process the relations */
export interface IRelationProcess {
  /** Whether the relation depends on other nodes */
  hasDepends: () => boolean;

  /** load relation kind data from relation schema */
  load(schema: RelationSchema, threadId?: string): Promise<void>;

  /** Attach the relation to the target */
  attach(relation: IRelation, owner: IValueAccess, target: IValueAccess): void;

  /** Detach the relation from the target */
  detach(relation: IRelation, owner: IValueAccess, target: IValueAccess): void;

  /** Execute the relation process and return the reuslt value */
  process(owner: IValueAccess, target: IValueAccess) : Promise<unknown>;
}