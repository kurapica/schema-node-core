import { RelationStage } from "../../enum/relationStage";

/** Pure data interface. */
export interface RelationSchema {
  /** The target of the relation */
  target: string;

  /** The property the relation applies to */
  property: string;

  /** The stage of the realtion been applied */
  stage: RelationStage;

  /** The relation kind */
  kind: string;

  /** The relation only works for the given schema kind(for property relation only) */
  forSchema?: string;

  /** The error message */
  error?: string;
}
