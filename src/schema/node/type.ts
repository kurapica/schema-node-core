import type { SchemaLoadState } from "../../enum/schemaLoadState";
import { combinePaths } from "../../utility/toolset";

/** The schema container node, which can contain other nodes, such as scalar, struct, enum, array, etc. */
export interface NodeSchema {
  /** The namespace which includes the schema */
  namespace?: string;

  /** The schema name */
  name: string;

  /** The schema kind */
  kind: string;

  /** Sub-schemas — only for namespace schemas. */
  schemas?: NodeSchema[];

  /** Compatible type names for coercion. */
  compatibles?: CompatibleSchema[];

  /** Schemas that reference (use) this one. */
  usedBy?: string[];

  /** Load state tracking. */
  loadState?: SchemaLoadState;

  /** The error status */
  error?: string;
}

/** A compatible type declaration (for type coercion). */
export interface CompatibleSchema {
  type: string;
}

/** Gets the node schema full name */
export function getNodeSchemaName(nodeSchema: NodeSchema) {
  return combinePaths(nodeSchema.namespace ?? "", nodeSchema.name);
}