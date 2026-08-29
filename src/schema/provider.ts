// =============================================================================
// Schema provider interfaces
// =============================================================================

import type { ApplyMode } from "../enum/applyMode/type";
import type { NodeSchema } from "./node/type";

/** Interface for node schema familiy */
export interface INodeSchemaProvider {
  /** Gets the node schemas */
  getSchema(names: string[]): Promise<NodeSchema[]>;

  /** Call the schema function */
  callFunction(schemaName: string, args: unknown[], retType?: string, applyMode?: ApplyMode): Promise<unknown>;
}

let schemaProvider: INodeSchemaProvider | undefined;

/** Sets the schema provider */
export function useSchemaProvider(provider: INodeSchemaProvider): void {
  schemaProvider = provider;
}

/** Gets the schema provider */
export function getSchemaProvider(): INodeSchemaProvider | undefined {
  return schemaProvider;
}