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

import { getNodeSchemaName, NodeSchema } from '../schema/nodeSchema';
import type { IProperty } from '../property/property';
import { ForSchema, OfSchema, SchemaGenerator, Append, GenericParameter, NodeSchemaKind } from '../property/index';
import { getMetaProperty } from '../attribute/meta';
import { SCHEMA_KIND_NAMESPACE, SCHEMA_KIND_NODE, SCHEMA_KIND_STRUCT } from '../utility/constant';
import { SchemaKind } from '../property/record/schemaKind';
import { NamespaceType, NodeType, GenericType } from './type';
import { SchemaLoadState } from '../enum/schemaLoadState';
import { RuntimeNodeType } from '../property/core/RuntimeNodeType';
import { getSchemaProvider } from '../schema/provider/schemaProvider';
import { combineProperties } from '../property/propertyOwner';

// #region ── Schema Kind Configuration ─────────────────────────────────────────────

/** The schema kind holder */
let _schemaKindHolder = new Map<string, Function>();

/** The schema kind properties */
let _schemaKindProperties = new Map<string, (new () => IProperty)[]>();

/** The node schema generators */
let _schemaGenerators = new Map<string, (namespace: string, name: string, target: object) => void>();

/**
 * Get the properties associated with a specific schema kind.
 * @param kind The schema kind
 * @returns An array of property factory functions
 */
export function getSchemaKindProperties(kind: string): (new () => IProperty)[] {
  const props = _schemaKindProperties.get(kind);
  if (!props) return [];
  return [...props]; // Return a copy to avoid external mutation
}

/** Gets the schema kinds the property can works with */
export function getPropertyForSchemas(prop: new () => IProperty) : string[] {
  return _schemaKindProperties.keys().filter(e => _schemaKindProperties.get(e)?.includes(prop)).toArray()
}

/** Whether the property works for the schema kind */
export function isSchemaKindProperty(kind: string, prop: new () => IProperty) : boolean {
  return _schemaKindProperties.get(kind)?.includes(prop) ?? false;
}

// #endregion

// #region ── System Schema Registration (NodeSchema family) ────────────────────────────

/** The type declared with schema type, the schema kind is also declare with node schema,
 * So we use this to track all
 */
const _schemaTypeRegistry = new Map<Function, string>();

/** Root namespace — holds all registered schemas in a tree. */
const rootNamespace : NodeSchema = { namespace: "", name: "", kind : SCHEMA_KIND_NAMESPACE };

/** Schema lookups by full name for fast access. */
const _schemaIndex = new Map<string, NodeSchema>();

/**
 * Register the schema type for a class constructor
 * @param typeCtor The type constructor
 * @param type The schema type
 */
export function registerSchemaType(typeCtor: Function, type: string): void {
  _schemaTypeRegistry.set(typeCtor, type);
}

/**
 * Gets the schema type for a class constructor
 * @param typeCtor The type constructor or instance
 * @returns The schema type or undefined if not registered
 */
export function getSchemaType(typeCtor: object): string | undefined {
  return _schemaTypeRegistry.get(typeof typeCtor === 'function' ? typeCtor : (typeCtor as any).constructor);
}

/**
 * Save a NodeSchema into the namespace tree.
 * This is THE public API for schema registration — mirrors C# SchemaRuntime.SaveSystemSchema().
 */
export function saveSystemSchema(schema: NodeSchema, loadStage: SchemaLoadState = SchemaLoadState.System): void {
  const ns = schema.namespace ?? '';

  // Set the load state flags for the schema
  _setLoadState(schema, loadStage);

  _registerInNamespace(ns, schema);
  _schemaIndex.set(getNodeSchemaName(schema), schema);
}

/** Look up a schema by full name. */
function getSystemSchema(fullName: string): NodeSchema | undefined {
  fullName = fullName.toLowerCase();
  const schema = _schemaIndex.get(fullName) ?? _findInNamespace(fullName);
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

// #region ── Node Type Resolution ─────────────────────────────────────────────────

const _nodeTypeGenerator = new Map<string, new () => NodeType>();

/** Root namespace type (lazy-init on first getNodeType call). */
let rootNamespaceType: NamespaceType | undefined;

function isNamespaceType(node: NodeType): boolean {
  return node instanceof NamespaceType;
}

/**
 * Resolve a runtime NodeType by full schema name.
 * 
 * Mirrors C# SchemaContext.GetNodeTypeAsync:
 *   1. Look up the NodeSchema by name from _schemaIndex
 *   2. Use _nodeTypeGenerator to find the NodeType class for the schema's kind
 *   3. Create the NodeType instance and call loadTypeAsync()
 *
 * @param fullName   The dotted full schema name (e.g. "system.string")
 * @param generics   Optional generic parameter declarations
 * @param genericParams Optional resolved generic type arguments
 * @param reload     If true, forces re-loading from provider
 */
export async function getNodeType(
  fullName: string,
  generics?: GenericParameter[],
  genericParams?: NodeType[],
  reload = false,
): Promise<NodeType | undefined> {
  fullName = fullName.toLowerCase().trim();

  // Generic type — the name matches a generic parameter → return the concrete type
  if (generics) {
    const gIdx = generics.findIndex(g => g.name.toLowerCase() === fullName);
    if (gIdx >= 0) {
      if (genericParams && gIdx < genericParams.length)
        return genericParams[gIdx];
      return new GenericType(fullName);
    }
  }

  // Walk namespace segments
  let genericPart : string | undefined = undefined;
  if (fullName.endsWith('>'))
  {
    const genericStart = fullName.indexOf('<');
    if (genericStart < 0)
    {
      console.error(`The "${fullName}" is not a valid type name.`)
      return undefined;
    }
    genericPart = fullName.substring(genericStart);
    fullName = fullName.substring(0, genericStart);
  }
  const parts = fullName.split('.');
  if (genericPart) parts.push(genericPart);

  // Load nodes
  if (!rootNamespaceType) rootNamespaceType = new NamespaceType();
  let node: NodeType | undefined = rootNamespaceType as unknown as NodeType;
  let currentPath = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!node) return undefined;
    currentPath = currentPath ? `${currentPath}.${part}` : part;
    node = await loadNodeTypeAsync(node, part, currentPath, generics, genericParams, reload, i + 1 == parts.length);
    if (!node) return undefined;
  }

  return node;
}

/** Load a single namespace segment. */
async function loadNodeTypeAsync(
  parent: NodeType,
  segment: string,
  fullPath: string,
  generics?: GenericParameter[],
  genericParams?: NodeType[],
  reload = false,
  isLast = false
): Promise<NodeType | undefined> {
  // Generic types: segment starts with '<', e.g. "list<system.string>"
  if (segment.startsWith('<')) return loadGenericTypeAsync(parent, segment, generics, genericParams);

  // Already loaded?
  const nsParent = isNamespaceType(parent) ? (parent as unknown as NamespaceType) : undefined;
  let result: NodeType | undefined = nsParent?.getNodeType(segment);
  if (result && result.loaded && !(isLast && reload)) return result;
  if (reload && !result) return undefined; // reload only on existing types

  // Load the NodeSchema
  const schema = await loadNodeSchema(nsParent, segment, reload);
  if (!schema) return undefined;

  // Resolve NodeType class from _nodeTypeGenerator
  const NodeTypeCtor = _nodeTypeGenerator.get(schema.kind) ?? NodeType;
  result ??= new NodeTypeCtor();
  result.namespace = nsParent;

  // Cache in parent namespace (strip sub-schemas first — they're saved separately)
  const schemas = schema.schemas;
  delete schema.schemas;
  if (nsParent !== result) {
    nsParent?.saveSubNodeSchema(schema);
    nsParent?.saveNodeType(segment, result);
  }

  // Load the type
  await result.loadTypeAsync(schema);

  // Save sub-schemas into NamespaceType
  if (result instanceof NamespaceType && schemas?.length)
    for (const s of schemas) result.saveSubNodeSchema(s);

  // Generic types reloading (clone schema to avoid mutation)
  for (const g of result.getGenericTypes())
    await g.loadTypeAsync({ ...schema }, g.genericParams);

  return result;
}

/** Load a generic type like "list<system.string>". */
async function loadGenericTypeAsync(
  node: NodeType,
  segment: string,
  generics?: GenericParameter[],
  genericParams?: NodeType[],
): Promise<NodeType | undefined> {
  const inner = segment.slice(1, -1); // strip '<' and '>'
  if (!node.generics) return undefined;

  // Check cache
  let genType = node.getGenericType(inner);
  if (genType && genType.loaded) return genType;

  // Parse generic params respecting nested <>, e.g. "system.point<system.int, system.number>"
  const genParams: NodeType[] = [];
  for (const paramName of splitGenericParams(inner)) {
    const resolved = await getNodeType(paramName, generics, genericParams);
    if (!resolved) return undefined;
    genParams.push(resolved);
  }

  if (node.generics.length !== genParams.length) return undefined;

  // Create generic type instance
  const NodeTypeCtor = node.constructor as new () => NodeType;
  genType = new NodeTypeCtor();
  genType.namespace = node.namespace;
  node.setGenericType(inner, genType);

  await genType.loadTypeAsync(node.getNodeSchema()!, genParams);
  return genType;
}

/**
 * Load a NodeSchema — first from namespace cache, then system index, then providers.
 * Schemas from multiple providers are COMBINED (not replaced), mirroring C# merging logic.
 */
async function loadNodeSchema(
  ns: NamespaceType | undefined,
  name: string,
  reload = false,
): Promise<NodeSchema | undefined> {
  const schemaName = ns ? `${ns.name}.${name}`.replace(/^\./, '') : name;

  // 1. Check namespace cache (unless reloading)
  if (!reload) {
    const cachedNodeSchema = ns?.getSubNodeSchema(name);
    if (cachedNodeSchema) return cachedNodeSchema;
  }

  // 2. Try system (built-in) schema
  let schema = getSystemSchema(schemaName);
  if (schema) {
    // Shallow clone so provider merges don't mutate the cached system schema
    schema = { ...schema, schemas: schema.schemas ? [...schema.schemas] : undefined };
  }

  // 3. Try loading from providers and combine
  const provider = getSchemaProvider();
  if (provider) {
    try {
      const loadSchemas = await provider.loadSchema([schemaName]);
      for (const loadSchema of loadSchemas) {
        loadSchema.loadState = SchemaLoadState.Service;

        if (!schema) {
          schema = loadSchema;
          continue;
        }

        // Merge load states
        schema.loadState = (schema.loadState ?? SchemaLoadState.None) | (loadSchema.loadState ?? SchemaLoadState.None);

        // Combine properties on the schema itself
        combineProperties(schema, loadSchema, SCHEMA_KIND_NODE);

        // For namespace schemas, merge sub-schemas
        if (loadSchema.kind === SCHEMA_KIND_NAMESPACE && loadSchema.schemas?.length) {
          if (!schema.schemas?.length) {
            schema.schemas = loadSchema.schemas;
          } else {
            // Merge sub-schemas
            const otherSchemas: NodeSchema[] = [];
            for (const other of loadSchema.schemas) {
              const existingIdx = schema.schemas.findIndex(
                s => s.name.toLowerCase() === other.name.toLowerCase(),
              );
              if (existingIdx >= 0) {
                if (schema.schemas[existingIdx].kind === other.kind) {
                  combineProperties(schema.schemas[existingIdx], other, SCHEMA_KIND_NODE);
                }
              } else {
                otherSchemas.push(other);
              }
            }
            if (otherSchemas.length > 0) {
              schema.schemas = [...schema.schemas, ...otherSchemas];
            }
          }
        }
      }
    } catch {
      // Provider failed, continue with what we have
    }
  }

  return schema;
}

/**
 * Split generic parameters respecting nested angle brackets.
 * Mirrors C# SpanReader.NextGenericParam().
 *
 * e.g. "system.string, system.point<system.int, system.number>"
 *   → ["system.string", "system.point<system.int, system.number>"]
 */
function* splitGenericParams(input: string): Generator<string> {
  let depth = 0;
  let start = 0;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '<') {
      depth++;
    } else if (ch === '>') {
      depth--;
    } else if (ch === ',' && depth === 0) {
      yield input.substring(start, i).trim();
      start = i + 1;
    }
  }

  // Last segment
  const last = input.substring(start).trim();
  if (last) yield last;
}

// #endregion

// #region ── Schema Runtime Setup ─────────────────────────────────────────────

/** Scan all registered schema type to build the schema runtime, this is called to init the schema runtime */
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
        existed.push(...appendProperties.getValue<(new () => IProperty)[]>()!);
        _schemaKindProperties.set(kind, Array.from(new Set(existed)));
      }

      // node type check
      const nodeSchemaKind = getMetaProperty(ctor, NodeSchemaKind);
      if (nodeSchemaKind?.hasValue)
      {
        const nodeTypeGenerator = getMetaProperty(ctor, RuntimeNodeType);
        if (nodeTypeGenerator)
          _nodeTypeGenerator.set(nodeSchemaKind.getValue<string>()!, nodeTypeGenerator.getValue<Function>() as new () => NodeType)
      }
    }

    // properties for schema kind
    const forSchema = getMetaProperty(ctor, ForSchema);
    if (forSchema?.hasValue) {
      const kinds = forSchema.getValue<string[]>() ?? [];
      for (const kind of kinds) {
        let existed = _schemaKindProperties.get(kind) ?? [];
        if (existed.some((f) => f.name === ctor.name)) continue; // avoid duplicates
        existed.push(ctor as unknown as new () => IProperty);
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

// #endregion