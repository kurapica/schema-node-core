// =============================================================================
// RuntimeStage — runtime lifecycle stages
// =============================================================================

export enum RuntimeStage {
  SystemSchemaLoading = 'systemSchemaLoading',
  SystemSchemaLoaded = 'systemSchemaLoaded',
  SchemaLoading = 'schemaLoading',
  SchemaLoaded = 'schemaLoaded',
  Activating = 'activating',
  Activated = 'activated',
  Deactivating = 'deactivating',
  Deactivated = 'deactivated',
}

export type RuntimeStageValue = `${RuntimeStage}`;
