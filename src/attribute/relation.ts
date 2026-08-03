// =============================================================================
// @Relation / @RelationAssign — declare how a property's value is computed
// Mirrors C# SchemaNode.Core/Attribute/RelationAttribute.cs
// =============================================================================

import { RelationStage } from '../enum/relationStage';
import { getPropertyName, OfSchema, RelationKind } from '../property';
import type { PropertyCtor } from '../property/property';
import { getTypeSchemaName } from '../runtime/schemaRuntime';
import { RelationSchema } from '../schema/relationSchema';
import { NODE_SELF, SCHEMA_KIND_PROPERTY } from '../utility/constant';
import { getMetaProperty } from './meta';

const RELATION_KEY = Symbol.for('schema-node:relation');

/** Resolve the canonical constructor for storing metadata. */
function getConstructor(target: object): Function {
  return typeof target === 'function' ? target : target.constructor;
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
  propClass: PropertyCtor,
  kind: string | PropertyCtor,
  value: unknown,
  target?: string,
  stage?: RelationStage
): ClassDecorator & PropertyDecorator {
  if (typeof kind !== 'string')
    kind = getMetaProperty(kind, RelationKind)?.getValue<string>() ?? '';
  if (!kind)
    throw new Error(`Can't figure out the relation kind of ${kind}`);

  return ((tar: object, _memberKey?: string) => {
    const ctor = getConstructor(tar);
    const schema: RelationSchema = {
      target: target && target.toLowerCase() != NODE_SELF ? target : (_memberKey ?? getMetaProperty(ctor, OfSchema)?.getValue<string>() === SCHEMA_KIND_PROPERTY ? getPropertyName(ctor as any) ?? '' : ''),
      property: getTypeSchemaName(propClass)!,
      kind,
      stage: stage ?? RelationStage.Load | RelationStage.Input,
      [kind]: value
    };
    ensureStore(ctor).push(schema);
  }) as ClassDecorator & PropertyDecorator;
}

// ── Retrieval ──────────────────────────────────────────────────────────────

/** Get all relation entries declared on a class constructor. */
export function getRelationSchemas(ctor: Function): RelationSchema[] {
  return (ctor as unknown as Record<symbol, RelationSchema[]>)[RELATION_KEY] ?? [];
}