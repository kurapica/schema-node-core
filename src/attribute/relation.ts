// =============================================================================
// @Relation / @RelationAssign — declare how a property's value is computed
// Mirrors C# SchemaNode.Core/Attribute/RelationAttribute.cs
// =============================================================================

import { RelationStage } from '../enum/relationStage';
import { RelationKind } from '../property';
import type { IProperty } from '../property/property';
import { getTypeSchemaName } from '../runtime/schemaRuntime';
import { RelationSchema } from '../schema/relationSchema';
import { NODE_SELF } from '../utility/constant';
import { isEmpty } from '../utility/toolset';
import { getMetaProperty } from './meta';

const RELATION_KEY = Symbol.for('schema-node:relation');

interface RelationEntry {
  schema: RelationSchema,
  _memberKey?: string | symbol;
}

/** Resolve the canonical constructor for storing metadata. */
function getConstructor(target: object): Function {
  return typeof target === 'function' ? target : target.constructor;
}

function ensureStore(ctor: Function): RelationEntry[] {
  const rec = ctor as unknown as Record<symbol, RelationEntry[]>;
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
): ClassDecorator & PropertyDecorator {
  if (typeof kind !== 'string')
    kind = getMetaProperty(kind, RelationKind)?.getValue<string>() ?? '';
  if (!kind)
    throw new Error(`Can't figure out the relation kind of ${kind}`);

  return ((tar: object, _memberKey?: string | symbol) => {
    const ctor = getConstructor(tar);
    const schema: RelationSchema = {
      target: target && target.toLowerCase() != NODE_SELF ? target : '',
      property: getTypeSchemaName(propClass)!,
      kind,
      stage: stage ?? RelationStage.Load | RelationStage.Input,
      [kind]: value
    };
    ensureStore(ctor).push({ schema, _memberKey });
  }) as ClassDecorator & PropertyDecorator;
}

// ── Retrieval ──────────────────────────────────────────────────────────────

/** Get all relation entries declared on a class constructor. */
export function getRelationSchemas(ctor: Function, field?: string | symbol): RelationSchema[] {
  const entrys = (ctor as unknown as Record<symbol, RelationEntry[]>)[RELATION_KEY] ?? [];
  return isEmpty(field) ? entrys.map(e => e.schema) : entrys.filter(e => e._memberKey == field).map(e => e.schema);
}