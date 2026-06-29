// =============================================================================
// SchemaRuntime — the central runtime registry
// Mirrors C# SchemaNode.Core/Runtime/SchemaRuntime.cs
//
// Manages:
//   - Namespace tree of registered schemas
//   - Schema kind registry with generator callbacks
//   - Scanning of @Meta(OfSchema, ...) decorated classes
//
// Different schema families extend this (e.g., AppSchemaRuntime adds saveAppSchema).
// =============================================================================

import { NodeSchema } from '../schema/nodeSchema';
import { NamespaceSchema } from '../schema/namespaceSchema';
import type { IProperty } from '../property/property';
import { ForSchema, OfSchema, SchemaType, SchemaGenerator } from '../property/index';
import { getMetaProperty } from '../attribute/meta';
import { SCHEMA_KIND_NAMESPACE } from '../utility/constant';

// ── Schema Kind Configuration ─────────────────────────────────────────────

/**
 * Configuration for a registered schema kind.
 * When a decorated class has @Meta(OfSchema, kind), the generator is invoked.
 */
export interface SchemaKindConfig {
  /** Generator callback — builds NodeSchema with extensions and calls runtime.saveSchema(). */
  generator?: (target: object, runtime: SchemaRuntime) => void;

  /** Property constructors available for this schema kind. */
  properties?: (new () => IProperty)[];
}

// ── SchemaRuntime ─────────────────────────────────────────────────────────

export class SchemaRuntime {
  /** Root namespace — holds all registered schemas in a tree. */
  readonly rootNamespace = new NodeSchema('', SCHEMA_KIND_NAMESPACE, '');

  /** Registered schema kinds: kind → config. */
  private _kindRegistry = new Map<string, SchemaKindConfig>();

  /** Schema lookups by full name for fast access. */
  private _schemaIndex = new Map<string, NodeSchema>();

  // ── Schema Kind Registration ──────────────────────────────────────────

  /**
   * Register a schema kind with its generator.
   * Called during system initialization to set up "struct", "function", "enum", etc.
   */
  registerSchemaKind(kind: string, config: SchemaKindConfig): void {
    this._kindRegistry.set(kind, config);
  }

  /** Get the config for a registered schema kind. */
  getSchemaKind(kind: string): SchemaKindConfig | undefined {
    return this._kindRegistry.get(kind);
  }

  /** Get all registered schema kinds. */
  getSchemaKinds(): ReadonlyMap<string, SchemaKindConfig> {
    return this._kindRegistry;
  }

  // ── Schema Registration (NodeSchema family) ────────────────────────────

  /**
   * Save a NodeSchema into the namespace tree.
   * This is THE public API for schema registration — mirrors C# SchemaRuntime.SaveSystemSchema().
   *
   * Two usage forms:
   *   A. Decorator form: @Meta(OfSchema, "struct") class Foo {} → generator calls this
   *   B. Direct API form: runtime.saveSchema(new StructSchema("myField", "myapp"))
   */
  saveSchema(schema: NodeSchema): void {
    const ns = schema.namespace ?? '';
    this._registerInNamespace(ns, schema);
    this._schemaIndex.set(schema.fullName, schema);
  }

  /** Register a schema by its full name string. */
  registerSchema(fullName: string, schema: NodeSchema): void {
    const lastDot = fullName.lastIndexOf('.');
    const ns = lastDot >= 0 ? fullName.substring(0, lastDot) : '';
    const name = lastDot >= 0 ? fullName.substring(lastDot + 1) : fullName;
    schema.namespace = ns;
    schema.name = name;
    this.saveSchema(schema);
  }

  /** Look up a schema by full name. */
  getSchema(fullName: string): NodeSchema | undefined {
    // Fast path: direct index
    const cached = this._schemaIndex.get(fullName);
    if (cached) return cached;

    // Slow path: walk namespace tree
    return this._findInNamespace(fullName);
  }

  // ── Decorated Class Scanning ───────────────────────────────────────────

  /**
   * Scan a decorated class/function and invoke the appropriate generator.
   * Called by: system startup scanning all @Meta(OfSchema, ...) targets.
   *
   * Flow:
   *   1. Read @Meta(OfSchema) → get the kind string
   *   2. Look up kind in _kindRegistry → get generator
   *   3. Invoke generator(target, this)
   *   4. Generator internally calls this.saveSchema()
   */
  scanDecoratedClass(target: object): void {
    const ofSchema = getMetaProperty(target as Function, OfSchema);
    if (!ofSchema?.hasValue) return;

    const kinds = ofSchema.getValue<string[]>() ?? [];
    for (const kind of kinds) {
      const config = this._kindRegistry.get(kind);
      if (config?.generator) {
        config.generator(target, this);
      }
    }
  }

  /**
   * Scan multiple decorated targets (e.g., all exported classes from a module).
   */
  scanDecoratedClasses(targets: object[]): void {
    for (const target of targets) {
      this.scanDecoratedClass(target);
    }
  }

  // ── Internal ───────────────────────────────────────────────────────────

  /** Walk a dotted path into the namespace tree, creating nodes as needed. */
  private _registerInNamespace(ns: string, schema: NodeSchema): void {
    if (!ns) {
      this.rootNamespace.schemas ??= [];
      this.rootNamespace.schemas.push(schema);
      return;
    }

    const parts = ns.split('.');
    let current = this.rootNamespace;

    for (const part of parts) {
      current.schemas ??= [];
      let child = current.schemas.find(
        (s) => s.name === part && s.kind === SCHEMA_KIND_NAMESPACE,
      );

      if (!child) {
        child = new NodeSchema(part, SCHEMA_KIND_NAMESPACE, current.fullName);
        current.schemas.push(child);
      }
      current = child;
    }

    current.schemas ??= [];
    current.schemas.push(schema);
  }

  /** Walk the namespace tree by dotted path. */
  private _findInNamespace(path: string): NodeSchema | undefined {
    const parts = path.split('.');
    let current: NodeSchema | undefined = this.rootNamespace;

    for (const part of parts) {
      if (!current?.schemas) return undefined;
      current = current.schemas.find((s) => s.name === part);
    }
    return current;
  }

  /** Get all schemas from a namespace. */
  getNamespaceSchemas(namespace: string): NodeSchema[] {
    const ns = this._findInNamespace(namespace);
    if (ns instanceof NodeSchema && ns.kind === SCHEMA_KIND_NAMESPACE) {
      // Return all schemas in this namespace (not just direct children)
      return ns.schemas ?? [];
    }
    return [];
  }
}

// ── Runtime Interfaces ────────────────────────────────────────────────────

/**
 * A stage handler participates in the runtime lifecycle.
 */
export interface IRuntimeStageHandler {
  onServiceInitialization?(runtime: SchemaRuntime): void;
  onSystemSchemaLoaded?(runtime: SchemaRuntime): void;
  onActivating?(runtime: SchemaRuntime): Promise<void>;
  onActivated?(runtime: SchemaRuntime): Promise<void>;
}
