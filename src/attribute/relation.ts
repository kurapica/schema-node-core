// =============================================================================
// @Relation / @RelationAssign — declare how a property's value is computed
// Mirrors C# SchemaNode.Core/Attribute/RelationAttribute.cs
// =============================================================================

import { RelationStage } from '../enum/relationStage';
import { RelationKind } from '../property';
import type { IProperty } from '../property/property';
import { getTypeSchemaName } from '../runtime/schemaRuntime';
import { RelationSchema } from '../schema/relationSchema';
import { getMetaProperty } from './meta';

const RELATION_KEY = Symbol.for('schema-node:relation');

interface RelationEntry {
  relation: RelationSchema,
  _memberKey?: string | symbol;
}

function ensureStore(ctor: Function): RelationSchema[] {
  const rec = ctor as unknown as Record<symbol, RelationSchema[]>;
  let store = rec[RELATION_KEY];
  if (!store) {
    store = [];
    rec[RELATION_KEY] = store;
  }
  return store;
}

// ── @Relation(propClass, kind, data[, target][, stage]) — Call relation ──────────────────

/**
 * Declare that a property's value is computed by calling a function.
 */
export function Relation(
  propClass: new () => IProperty,
  kind: string | (new() => IProperty),
  value: unknown,
  target?: string,
  stage?: RelationStage
): ClassDecorator {
  if (typeof kind !== 'string')
    kind = getMetaProperty(kind, RelationKind)?.getValue<string>() ?? '';
  if (!kind)
    throw new Error(`Can't figure out the relation kind of ${kind}`);

  return ((tar: object) => {
    const scheam: RelationSchema = {
      target: target ?? '',
      property: getTypeSchemaName(propClass)!,
      kind,
      stage: stage ?? RelationStage.Load | RelationStage.Input,
      [kind]: value
    };
    ensureStore(tar as Function).push(scheam);
  }) as ClassDecorator;
}

// ── Retrieval ──────────────────────────────────────────────────────────────

/** Get all relation entries declared on a class constructor. */
export function getRelationSchemas(ctor: Function): RelationSchema[] {
  return (ctor as unknown as Record<symbol, RelationSchema[]>)[RELATION_KEY] ?? [];
}