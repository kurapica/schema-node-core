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

import type { IProperty, PropertyCtor, INodeType } from '../interface';
import { getMetaProperties } from '../attribute/meta';
import { NS_SYSTEM_SCHEMA_DESIGN, SCHEMA_KIND_NAMESPACE, SCHEMA_KIND_STRUCT } from '../utility/constant';
import { SchemaLoadState } from '../enum/schemaLoadState';
import { combinePaths } from '../utility/toolset';
import { getNodeSchemaName } from '../schema/node/type';
import type { NodeSchema } from '../schema/node/type';
import type { StructSchema } from '../schema/struct/type';

// #region ── Schema Kind Configuration ───────────────────────────────────────

/** The schema kind holder */
const _schemaKindHolder = new Map<string, Function>();

/** The schema kind property types */
const _schemaKindPropertyTypes = new Map<string, PropertyCtor[]>();

/** The schema kind prototype properties */
const _schemaKindProperties = new Map<string, IProperty[]>();

/** The node schema generators */
const _schemaGenerators = new Map<string, (namespace: string, name: string, target: object) => void>();

/**
 * Get the properties associated with a specific schema kind.
 * @param kind The schema kind
 * @returns An array of property factory functions
 */
export function *getSchemaKindPropertyTypes(kind: string): Generator<PropertyCtor> {
  const props = _schemaKindPropertyTypes.get(kind);
  if (!props) return;
  yield* props;
}

/** Gets the schema kinds the property can works with */
export function getPropertyTypeSupportSchemas(prop: PropertyCtor) : string[] {
  return Array.from(_schemaKindPropertyTypes.keys().filter(e => _schemaKindPropertyTypes.get(e)?.includes(prop)))
}

/** Whether the property works for the schema kind */
export function isSchemaKindPropertyType(kind: string, prop: PropertyCtor) : boolean {
  return _schemaKindPropertyTypes.get(kind)?.includes(prop) ?? false;
}

/** Gets the schema kind prototype property */
export function getSchemaKindProperty<T extends IProperty>(kind: string, propCtor: PropertyCtor | string): T | undefined {
  return typeof propCtor === 'string'
    ? _schemaKindProperties.get(kind)?.find(p => p.name.toLowerCase() === propCtor.toLowerCase()) as T
    : _schemaKindProperties.get(kind)?.find(p => p instanceof propCtor) as T;
}

/** Gets the schema kind prototype properties */
export function *getSchemaKindProperties<T extends IProperty>(kind: string, propCtor: PropertyCtor | string): Generator<T> {
  const props = _schemaKindProperties.get(kind);
  if (!props?.length) return;
  for (let prop of props)
  {
    if (typeof propCtor === 'string' ? prop.name.toLowerCase() === propCtor.toLowerCase() : prop instanceof propCtor)
    {
      yield prop as T;
      if (!prop.stackable) return;
    }
  }
}

/** Filter the schema kind prototype properties */
export function *filterSchemaKindProperties(kind: string, predicate: (prop: IProperty) => boolean): Generator<IProperty> {
  const props = _schemaKindProperties.get(kind);
  if (!props?.length) return;
  for (let prop of props)
  {
    if (predicate(prop))
    {
      yield prop;
      if (!prop.stackable) return;
    }
  }
}

// #endregion

// #region ── System Schema Registration (NodeSchema family) ──────────────────

/** The schema kind registry */
const _schemaKindRegistry = new Map<string, Function>();

/** The schema property registry */
const _schemaPropertyRegistry = new Set<Function>();

/** The type declared with schema type, the schema kind is also declare with node schema,
 * So we use this to track all
 */
const _schemaTypeRegistry = new Map<string, Function>();

/** Root namespace — holds all registered schemas in a tree. */
const rootNamespace : NodeSchema = { namespace: "", name: "", kind : SCHEMA_KIND_NAMESPACE };

/** Schema lookups by full name for fast access. */
const _schemaIndex = new Map<string, NodeSchema>();

/** Register the schema kind for a class constructor */
export function registerSchemaKind(kind: string, kindCtor: Function): void {
  _schemaKindRegistry.set(kind.toLowerCase(), kindCtor);
}

/** Register the schema property for a class constructor */
export function registerSchemaProperty(propCtor: Function): void {
  _schemaPropertyRegistry.add(propCtor);
}

/* Register the schema type for a class constructor */
export function registerSchemaType(type: string, typeCtor: Function): void {
  _schemaTypeRegistry.set(type.toLowerCase(), typeCtor);
}

/** Gets the schema type for a class constructor */
export function getSchemaKindRegister(kind: string): Function | undefined {
  return _schemaKindRegistry.get(kind.toLowerCase());
}

/**
 * Gets the schema type for a class constructor
 * @param typeCtor The type constructor or instance
 * @returns The schema type or undefined if not registered
 */
export function getSchemaType(type: string): Function | undefined {
  return _schemaTypeRegistry.get(type.toLowerCase());
}

/** Gets the schema name of the type */
export function getTypeSchemaName(typeCtor: Function): string | undefined {
  return (typeCtor as unknown as Record<string, string>).schemaType;
}

/**
 * Save a NodeSchema into the namespace tree.
 * This is THE public API for schema registration — mirrors C# SchemaRuntime.saveNodeSchema().
 */
export function saveNodeSchema(schema: NodeSchema | NodeSchema[], loadStage: SchemaLoadState = SchemaLoadState.System): void {
  if (Array.isArray(schema)) {
    for (const s of schema) {
      saveNodeSchema(s, loadStage);
    }
    return;
  }
  if (!(schema)) return;

  console.log("saveNodeSchema", schema);
  
  // Set the load state flags for the schema
  _setLoadState(schema, loadStage);

  // System schema, register in the namespace tree
  _registerInNamespace(schema.namespace ?? '', schema);
  _schemaIndex.set(getNodeSchemaName(schema), schema);
}

/** Look up a schema by full name. */
export function getSystemSchema(fullName: string): NodeSchema | undefined {
  fullName = fullName.toLowerCase();
  const schema = !fullName ? rootNamespace : _schemaIndex.get(fullName) ?? _findInNamespace(fullName);
  if (!schema) return undefined;

  const { schemas, ...clone } = schema
  if (schema?.kind === SCHEMA_KIND_NAMESPACE && schema.schemas)
    (clone as NodeSchema).schemas = schema.schemas.map(({ schemas, ...child }) => child);
  return clone;
}


// #region ── Internal ──

/** Set the load state flags for a schema and its children. */
function _setLoadState(schema: NodeSchema, loadStage: SchemaLoadState): void {
  schema.loadState ??= loadStage;
  schema.loadState! |= loadStage;

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
      throw new Error(`Schema conflict: ${getNodeSchemaName(child)} is not a namespace`);
    }

    if (!child) {
      child = { namespace : getNodeSchemaName(current), name: part, kind : SCHEMA_KIND_NAMESPACE };
      current.schemas.push(child);
    }
    current = child;
  }

  current.schemas ??= [];
  const idx = current.schemas.findIndex((s) => s.name === schema.name);
  if (idx >= 0) {
    if (current.schemas[idx].kind !== schema.kind)
      throw new Error(`Schema conflict: ${getNodeSchemaName(current.schemas[idx])} is of kind ${current.schemas[idx].kind}, cannot replace with kind ${schema.kind}`);
    current.schemas[idx] = schema; // replace existing
  } else {
    current.schemas.push(schema);
  }
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

// #endregion

// #endregion

// #region ── Node Type Resolution ────────────────────────────────────────────

const _nodeTypeGenerator = new Map<string, new (parent?: INodeType) => INodeType>();

/** Get the node type generator for a kind. */
export function getNodeTypeGenerator(kind: string): (new (parent?: INodeType) => INodeType) | undefined {
  return _nodeTypeGenerator.get(kind);
}

//#endregion

// #region ── Schema Runtime Setup ────────────────────────────────────────────

/** Scan all registered schema type to build the schema runtime, this is called to init the schema runtime */
export function initSchemaRuntime(): void {
  // Scan schema kinds
  _schemaKindRegistry.forEach((ctor, kind) => {
    _schemaKindHolder.set(kind, ctor);

    // generator check
    const generator = (ctor as unknown as Record<string, Function>).schemaGenerator;
    if (generator) {
      _schemaGenerators.set(kind, generator as (namespace: string, name: string, target: object) => void);
    }

    // append properties to the schema kind registry
    const appendProperties = (ctor as unknown as Record<string, PropertyCtor[]>).append;
       if (appendProperties?.length) {
      let existed = _schemaKindPropertyTypes.get(kind) ?? [];
      existed.push(...appendProperties);
      _schemaKindPropertyTypes.set(kind, Array.from(new Set(existed)));
    }

    // node type check
    const nodeSchemaKind = (ctor as unknown as Record<string, string>).nodeSchemaKind;
    if (nodeSchemaKind)
    {
      const nodeTypeGenerator = (ctor as unknown as Record<string, new () => INodeType>).runtimeNodeType;
      if (nodeTypeGenerator)
        _nodeTypeGenerator.set(nodeSchemaKind, nodeTypeGenerator as new () => INodeType)
    }

    // Prototype properties
    const prototypeProps = getMetaProperties(ctor).filter(p => (p.constructor as unknown as Record<string, string[]>).forSchema?.includes(kind))
    if (prototypeProps?.length)
      _schemaKindProperties.set(kind, prototypeProps);

    // register struct with kind properties, special for schema creation
    // system.schema.design.{kind} -> hold all properties for the kind
    const nodeSchema: NodeSchema & { display: { key: string }, struct: StructSchema & { attach: string } } = { 
      namespace: NS_SYSTEM_SCHEMA_DESIGN, 
      name: kind, 
      kind: SCHEMA_KIND_STRUCT, 
      display: { key: combinePaths(NS_SYSTEM_SCHEMA_DESIGN, kind)},
      struct: { attach: kind, fields: [] }
    };
    saveNodeSchema(nodeSchema);
  });

  // Scan registered properties
  _schemaPropertyRegistry.forEach((ctor) => {
    const forSchema = (ctor as unknown as Record<string, string[]>).forSchema;
    if (forSchema?.length) {
      const kinds = forSchema;
      for (const kind of kinds) {
        let existed = _schemaKindPropertyTypes.get(kind) ?? [];
        if (existed.some((f) => f.name === ctor.name)) continue; // avoid duplicates
        existed.push(ctor as unknown as PropertyCtor);
        _schemaKindPropertyTypes.set(kind, existed);
      }
    }
  });

  // Scan all registered schema type to build the schema runtime, this is called to init the schema runtime
  _schemaTypeRegistry.forEach((ctor, type) => {
    const ofSchema = (ctor as unknown as Record<string, string>).ofSchema;
    const kind = ofSchema ?? SCHEMA_KIND_STRUCT;
    const generator = _schemaGenerators.get(kind);
    if (!generator) throw new Error(`No generator registered for schema kind ${kind} (class ${ctor.name})`);

    // Split the schema type into namespace and name
    type = type.toLowerCase();
    const lastDot = type.lastIndexOf('.');
    const ns = lastDot >= 0 ? type.substring(0, lastDot) : '';
    const name = lastDot >= 0 ? type.substring(lastDot + 1) : type;
    
    // Call the generator to create the NodeSchema and register it
    generator(ns, name, ctor);
  });
}

// #endregion

/**
 * Get Meta properties filtered by ForSchema kind. 
 */
export function getMetaPropertiesForSchema<T extends IProperty>(
  kind: string,
  ctor: Function,
  propCtor?: new () => T,
  field?: string | symbol,
  index?: number
): T[] {
  return getMetaProperties(ctor, propCtor, field, index)
    .filter((p) => isSchemaKindPropertyType(kind, p.constructor as unknown as PropertyCtor));
}
