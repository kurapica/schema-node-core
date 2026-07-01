// =============================================================================
// SchemaRuntime — the central runtime registry
// Mirrors C# SchemaNode.Core/Runtime/SchemaRuntime.cs
//
// Manages:
//   - Namespace tree of registered schemas
//   - Schema kind registry with generator callbacks
//   - Scanning of @Meta(SchemaType, ...) decorated classes
//
// Notice: There is no need to create an instance of SchemaRuntime, it is a singleton and all methods are static.
// =============================================================================

import { NodeSchema, SchemaLoadState } from '../schema/nodeSchema';
import type { IProperty } from '../property/property';
import { ForSchema, OfSchema, SchemaGenerator, Append } from '../property/index';
import { getMetaProperty } from '../attribute/meta';
import { SCHEMA_KIND_NAMESPACE, SCHEMA_KIND_STRUCT } from '../utility/constant';
import { SchemaKind } from '../property/record/schemaKind';

// ── Schema Kind Configuration ─────────────────────────────────────────────

/** The schema kind holder */
let _schemaKindHolder = new Map<string, Function>();

/** The schema kind properties */
let _schemaKindProperties = new Map<string, (() => IProperty)[]>();

/** The node schema generators */
let _schemaGenerators = new Map<string, (namespace: string, name: string, target: object) => void>();

/**
 * Get the properties associated with a specific schema kind.
 * @param kind The schema kind
 * @returns An array of property factory functions
 */
export function* getSchemaKindProperties(kind: string): Generator<() => IProperty> {
  for (const prop of _schemaKindProperties.get(kind) ?? []) {
    yield prop;
  }
}

// ── Schema Registration (NodeSchema family) ────────────────────────────

/** The type declared with schema type, the schema kind is also declare with node schema,
 * So we use this to track all
 */
let _schemaTypeRegistry = new Map<Function, string>();

/** Root namespace — holds all registered schemas in a tree. */
let rootNamespace = new NodeSchema('', SCHEMA_KIND_NAMESPACE, '');

/** Schema lookups by full name for fast access. */
let _schemaIndex = new Map<string, NodeSchema>();

/**
 * Register the schema type for a class constructor
 * @param typeCtor The type constructor
 * @param type The schema type
 */
export function registerSchemaType(typeCtor: Function, type: string): void {
  _schemaTypeRegistry.set(typeCtor, type);
}

/**
 * Scan all registered schema type to build the schema runtime, this is called to init the schema runtime
 */
export function initSchemaRuntime(): void {
  // schema kind & generator & properties
  _schemaTypeRegistry.forEach((type, ctor) => {
    // schema kinds
    const schemaKind = getMetaProperty(ctor, SchemaKind);
    if (schemaKind?.hasValue) {
      const kind = schemaKind.getValue<string>()!;
      _schemaKindHolder.set(kind, ctor);

      // generator check
      const generator = getMetaProperty(ctor, SchemaGenerator);
      if (generator?.hasValue) {
        _schemaGenerators.set(kind, generator.getValue<(namespace: string, name: string, target: object) => void>()!);
      }

      // append properties to the schema kind registry
      const appendProperties = getMetaProperty(ctor, Append);
      if (appendProperties?.hasValue) {
        let existed = _schemaKindProperties.get(kind) ?? [];
        existed.push(...appendProperties.getValue<(() => IProperty)[]>()!);
        _schemaKindProperties.set(kind, Array.from(new Set(existed)));
      }
    }

    // properties for schema kind
    const forSchema = getMetaProperty(ctor, ForSchema);
    if (forSchema?.hasValue) {
      const kinds = forSchema.getValue<string[]>() ?? [];
      for (const kind of kinds) {
        let existed = _schemaKindProperties.get(kind) ?? [];
        if (existed.some((f) => f.name === ctor.name)) continue; // avoid duplicates
        existed.push(ctor as unknown as () => IProperty);
        _schemaKindProperties.set(kind, existed);
      }
    }
  });

  // Scan all registered schema type to build the schema runtime, this is called to init the schema runtime
  _schemaTypeRegistry.forEach((type, ctor) => {
    const ofSchema = getMetaProperty(ctor, OfSchema);
    const kind = ofSchema?.hasValue ? ofSchema.getValue<string>()! : SCHEMA_KIND_STRUCT;
    const generator = _schemaGenerators.get(kind);
    if (!generator) throw new Error(`No generator registered for schema kind ${kind} (class ${ctor.name})`);

    // Split the schema type into namespace and name
    type = type.toLocaleLowerCase();
    const lastDot = type.lastIndexOf('.');
    const ns = lastDot >= 0 ? type.substring(0, lastDot) : '';
    const name = lastDot >= 0 ? type.substring(lastDot + 1) : type;
    
    // Call the generator to create the NodeSchema and register it
    generator(ns, name, ctor);
  });
}

/**
 * Save a NodeSchema into the namespace tree.
 * This is THE public API for schema registration — mirrors C# SchemaRuntime.SaveSystemSchema().
 */
export function saveSchema(schema: NodeSchema, loadStage: SchemaLoadState = SchemaLoadState.None): void {
  const ns = schema.namespace ?? '';

  // Set the load state flags for the schema
  _setLoadState(schema, loadStage);

  _registerInNamespace(ns, schema);
  _schemaIndex.set(schema.fullName, schema);
}

/** Look up a schema by full name. */
export function getSchema(fullName: string): NodeSchema | undefined {
  fullName = fullName.toLowerCase();
  return _schemaIndex.get(fullName) ?? _findInNamespace(fullName);
}

/** Delete a schema by full name. */
export function deleteSchema(fullName: string): boolean {
  fullName = fullName.toLowerCase();
  if (_deleteFromNamespace(fullName))
    return _schemaIndex.delete(fullName);
  return false;
}

// ── Internal ───────────────────────────────────────────────────────────

/** Set the load state flags for a schema and its children. */
function _setLoadState(schema: NodeSchema, loadStage: SchemaLoadState): void {
  schema.loadState ??= loadStage;
  schema.loadState |= loadStage;

  if (schema.kind === SCHEMA_KIND_NAMESPACE && schema.schemas) {
    for (const child of schema.schemas) {
      _setLoadState(child, loadStage);
    }
  }
}

/** Walk a dotted path into the namespace tree, creating nodes as needed. */
function _registerInNamespace(ns: string, schema: NodeSchema): void {
  if (!ns) {
    rootNamespace.schemas ??= [];
    rootNamespace.schemas.push(schema);
    return;
  }

  const parts = ns.split('.');
  let current = rootNamespace;

  for (const part of parts) {
    current.schemas ??= [];
    let child = current.schemas.find((s) => s.name === part);
    if (child && child.kind !== SCHEMA_KIND_NAMESPACE) {
      throw new Error(`Schema conflict: ${child.fullName} is not a namespace`);
    }

    if (!child) {
      child = new NodeSchema(part, SCHEMA_KIND_NAMESPACE, current.fullName);
      current.schemas.push(child);
    }
    current = child;
  }

  current.schemas ??= [];
  const idx = current.schemas.findIndex((s) => s.name === schema.name);
  if (idx >= 0) {
    if (current.schemas[idx].kind !== schema.kind)
      throw new Error(`Schema conflict: ${current.schemas[idx].fullName} is of kind ${current.schemas[idx].kind}, cannot replace with kind ${schema.kind}`);
    current.schemas[idx] = schema; // replace existing
  } else {
    current.schemas.push(schema);
  }
}

/** Walk a dotted path into the namespace tree, deleting a node if it exists. */
function _deleteFromNamespace(path: string): boolean {
  const parts = path.split('.');
  let current: NodeSchema | undefined = rootNamespace;
  let parent: NodeSchema | undefined = undefined;

  for (const part of parts) {
    if (!current?.schemas) return false;
    parent = current;
    current = current.schemas.find((s) => s.name === part);
    if (!current) return false;
  }

  if (!parent?.schemas) return false;
  const idx = parent.schemas.findIndex((s) => s.name === current.name);
  if (idx < 0) return false;

  parent.schemas.splice(idx, 1);
  return true;
}

/** Walk the namespace tree by dotted path. */
function _findInNamespace(path: string): NodeSchema | undefined {
  const parts = path.split('.');
  let current: NodeSchema | undefined = rootNamespace;

  for (const part of parts) {
    if (!current?.schemas) return undefined;
    current = current.schemas.find((s) => s.name === part);
  }
  return current;
}