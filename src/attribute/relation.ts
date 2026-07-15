// =============================================================================
// @Relation / @RelationAssign — declare how a property's value is computed
// Mirrors C# SchemaNode.Core/Attribute/RelationAttribute.cs
// =============================================================================

import { RelationStage } from '../enum/relationStage';
import type { IProperty } from '../property/property';
import { getTypeSchemaName } from '../runtime/schemaRuntime';
import { RelationSchema } from '../schema/relationSchema';

const RELATION_KEY = Symbol.for('schema-node:relation');

function ensureStore(ctor: Function): RelationSchema[] {
  const rec = ctor as unknown as Record<symbol, RelationSchema[]>;
  let store = rec[RELATION_KEY];
  if (!store) {
    store = [];
    rec[RELATION_KEY] = store;
  }
  return store;
}

// ── @Relation(propClass, data[, target][, stage]) — Call relation ──────────────────

/**
 * Declare that a property's value is computed by calling a function.
 */
export function Relation(
  propClass: new () => IProperty,
  data: Record<string, unknown>,
  target?: string,
  stage?: RelationStage
): ClassDecorator {
  return ((tar: object) => {
    const scheam: RelationSchema = {
      target: target ?? '',
      property: getTypeSchemaName(propClass)!,
      kind: '',
      stage: stage ?? RelationStage.Load | RelationStage.Input,
      ...data
    };

    // Use data key as kind
    for(let kind in data)
    {
      scheam.kind = kind;
      break;
    }
    ensureStore(tar as Function).push(scheam);
  }) as ClassDecorator;
}

// ── Retrieval ──────────────────────────────────────────────────────────────

/** Get all relation entries declared on a class constructor. */
export function getRelationSchemas(ctor: Function): RelationEntry[] {
  return (ctor as unknown as Record<symbol, RelationEntry[]>)[RELATION_KEY] ?? [];
}