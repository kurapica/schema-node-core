// =============================================================================
// Service registration & lifecycle management
// =============================================================================

import { SchemaRuntime, type IRuntimeStageHandler } from '../runtime/schemaRuntime';
import { registerStructGenerator } from '../generator/structGenerator';
import { registerFunctionGenerator } from '../generator/functionGenerator';
import { registerEnumGenerator } from '../generator/enumGenerator';
import { registerPropertyGenerator } from '../generator/propertyGenerator';
import { registerScalarGenerators } from '../generator/scalarGenerator';

/**
 * Create and initialize a SchemaRuntime with default generators.
 */
export function createSchemaRuntime(stageHandlers?: IRuntimeStageHandler[]): SchemaRuntime {
  const runtime = new SchemaRuntime();

  // Register built-in schema kind generators
  registerStructGenerator(runtime);
  registerFunctionGenerator(runtime);
  registerEnumGenerator(runtime);
  registerPropertyGenerator(runtime);
  registerScalarGenerators(runtime);

  // Lifecycle: service initialization
  for (const handler of stageHandlers ?? []) {
    handler.onServiceInitialization?.(runtime);
  }

  return runtime;
}

/**
 * Scan a set of decorated classes against the given runtime.
 * Typically called after registering system types/functions.
 */
export function scanModules(runtime: SchemaRuntime, modules: object[]): void {
  runtime.scanDecoratedClasses(modules);
}

/**
 * Complete system schema loading lifecycle.
 */
export async function activateRuntime(runtime: SchemaRuntime, handlers?: IRuntimeStageHandler[]): Promise<void> {
  for (const handler of handlers ?? []) {
    await handler.onActivating?.(runtime);
  }
  for (const handler of handlers ?? []) {
    await handler.onActivated?.(runtime);
  }
}
