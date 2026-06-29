// =============================================================================
// Default runtime stage handler
// =============================================================================

import type { IRuntimeStageHandler } from '../runtime/schemaRuntime';
import type { SchemaRuntime } from '../runtime/schemaRuntime';

/**
 * Default handler: scans system modules and registers system schemas.
 */
export class DefaultRuntimeStageHandler implements IRuntimeStageHandler {
  private _systemModules: object[];

  constructor(systemModules: object[]) {
    this._systemModules = systemModules;
  }

  onServiceInitialization(runtime: SchemaRuntime): void {
    // Scan provided system modules
    runtime.scanDecoratedClasses(this._systemModules);
  }

  async onActivating(runtime: SchemaRuntime): Promise<void> {
    // Pre-load / activate discovered system schemas
    void runtime;
  }
}
