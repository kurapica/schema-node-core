// =============================================================================
// Schema provider interfaces
// =============================================================================

import type { NodeSchema } from '../nodeSchema';
import type { EnumValueAccess, EnumValueInfo } from '../enumSchema';

/** Interface for loading NodeSchemas by name. */
export interface INodeSchemaProvider {
  loadSchema(names: string[]): Promise<NodeSchema[]>;
}

/** Interface for lazy-loading enum value sub-trees. */
export interface IEnumSchemaProvider {
  loadEnumSubList(schemaName: string, value?: string): Promise<EnumValueInfo[]>;
  loadEnumAccessList(schemaName: string, value: string): Promise<EnumValueAccess[]>;
}

/** Interface for remote function call execution. */
export interface IFunctionSchemaProvider {
  callFunction(schemaName: string, args: unknown[], retType?: string, target?: string): Promise<unknown>;
}
