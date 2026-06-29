// =============================================================================
// @Relation / @RelationAssign — declare how a property's value is computed
// Mirrors C# SchemaNode.Core/Attribute/RelationAttribute.cs
//
// Architecture:
//   RelationSchema { Target, Property, Stage, Kind }  — the schema declaration
//   IRelationProcess { LoadAsync, ProcessAsync }       — the execution body
//   Call { Func, Args }                                — function-call relation
//   Assign { Value }                                   — static-value relation
//
// Usage:
//   @Relation(Visible, "system.reflect.isvaluekind", "$Type", "enum")
//     → Call("system.reflect.isvaluekind", [CallArg("$Type"), CallArg("enum")])
//   @RelationAssign(Valid, "$self", "system.intrinsic.null")
//     → Assign("system.intrinsic.null")
// =============================================================================

import { RelationStage } from '../enum/relationStage';
import type { IProperty } from '../property/property';

// ── CallArg ────────────────────────────────────────────────────────────────

/** A single argument in a relation function call. */
export interface CallArg {
  /** Source access path (starts with $), or undefined for literal value. */
  source?: string;
  /** Literal value — used when source is undefined. */
  value?: unknown;
}

// ── IRelationProcess (execution body) ──────────────────────────────────────

/** The execution body of a relation. Implemented by Call and Assign. */
export interface IRelationProcess {
  kind: 'call' | 'assign';
}

// ── Call — function-call relation ──────────────────────────────────────────

/** Invoke a function with arguments to compute a property value. */
export interface Call extends IRelationProcess {
  kind: 'call';
  func: string;
  args: CallArg[];
}

/** Create a Call relation process. */
export function createCall(func: string, args: CallArg[]): Call {
  return { kind: 'call', func, args };
}

// ── Assign — static-value relation ─────────────────────────────────────────

/** Assign a static value to a property. */
export interface Assign extends IRelationProcess {
  kind: 'assign';
  value: unknown;
}

/** Create an Assign relation process. */
export function createAssign(value: unknown): Assign {
  return { kind: 'assign', value };
}

// ── RelationEntry — stored on a property class's constructor ───────────────

interface RelationEntry {
  /** The property class this relation computes (e.g., Visible, Default). */
  propertyClass: Function;
  /** The IRelationProcess (Call or Assign). */
  process: Call | Assign;
  /** The target path (e.g., "$self", or null for default). */
  target?: string;
  /** When to apply (Load | Input). */
  stage: number;
}

const RELATION_KEY = Symbol.for('schema-node:relation');

function ensureStore(ctor: Function): RelationEntry[] {
  const rec = ctor as unknown as Record<symbol, RelationEntry[]>;
  let store = rec[RELATION_KEY];
  if (!store) {
    store = [];
    rec[RELATION_KEY] = store;
  }
  return store;
}

// ── @Relation(propClass, func, ...args) — Call relation ──────────────────

/**
 * Declare that a property's value is computed by calling a function.
 *
 * @param propClass  The property class to compute (e.g., Visible, Default).
 * @param func       The function name to call (e.g., "system.reflect.isvaluekind").
 * @param args       Call arguments — strings starting with `$` are source paths, otherwise literal values.
 *
 * Example:
 *   @Relation(Visible, "system.reflect.isvaluekind", "$Type", "enum")
 *   → When computing Visible, call isvaluekind(resolve("$Type"), "enum")
 */
export function Relation(
  propClass: new () => IProperty,
  func: string,
  ...args: string[]
): ClassDecorator {
  return ((target: object) => {
    const callArgs: CallArg[] = args.map((a) => {
      if (typeof a === 'string' && a.startsWith('$') && !a.startsWith('$$')) {
        return { source: a };
      }
      return { value: a };
    });
    ensureStore(target as Function).push({
      propertyClass: propClass,
      process: createCall(func, callArgs),
      stage: RelationStage.Load | RelationStage.Input,
    });
  }) as ClassDecorator;
}

// ── @RelationAssign(propClass, target, value) — Assign relation ──────────

/**
 * Declare that a property is assigned a static value (optionally on a target).
 *
 * @param propClass  The property class being assigned.
 * @param value      The static value to assign.
 * @param target     Optional target path (e.g., "$self").
 *
 * Example:
 *   @RelationAssign(Valid, "system.intrinsic.null")
 *   → Assign Valid the value "system.intrinsic.null"
 */
export function RelationAssign(
  propClass: new () => IProperty,
  value: unknown,
  target?: string,
): ClassDecorator {
  return ((targetObj: object) => {
    ensureStore(targetObj as Function).push({
      propertyClass: propClass,
      process: createAssign(value),
      target: target,
      stage: RelationStage.Load | RelationStage.Input,
    });
  }) as ClassDecorator;
}

// ── Retrieval ──────────────────────────────────────────────────────────────

/** Get all relation entries declared on a class constructor. */
export function getRelationEntries(ctor: Function): RelationEntry[] {
  return (ctor as unknown as Record<symbol, RelationEntry[]>)[RELATION_KEY] ?? [];
}

