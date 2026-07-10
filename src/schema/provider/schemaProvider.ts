// =============================================================================
// Schema provider interfaces
// =============================================================================

import type { NodeSchema } from '../nodeSchema';
import type { EnumValueAccess, EnumValueSchema } from '../enumSchema';

/** Interface for node schema familiy */
export interface INodeSchemaProvider {
  loadSchema(names: string[]): Promise<NodeSchema[]>;
  loadEnumSubList(schemaName: string, value?: string): Promise<EnumValueSchema[]>;
  loadEnumAccessList(schemaName: string, value: string): Promise<EnumValueAccess[]>;
  callFunction(schemaName: string, args: unknown[], retType?: string): Promise<unknown>;
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