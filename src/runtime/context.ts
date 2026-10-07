import { SchemaLoadState } from "../enum/schemaLoadState";
import { hasNodeReferences, isNamespaceNodeType } from "../interface";
import { combineProperties, getPropertyValue } from "../property/propertyOwner";
import { getSchemaProvider } from "../schema/provider";
import { getNodeTypeGenerator, getSystemSchema } from "./schemaRuntime";
import { logger } from "../utility/logger";
import { generateGuid, isNull, splitString, useShareQuery } from "../utility/toolset";
import { SystemDefined } from "../property/core/systemDefined";
import { getNodeSchemaName, type NodeSchema } from "../schema/node/type";

import type { INamespaceNodeType, INodeReference, INodeType } from "../interface";
import type { GenericParameter } from "../schema/generic/type";

import { SCHEMA_KIND_NODE, NODE_KIND_NAMESPACE, NODE_KIND_GENERIC } from "../utility/constant";

/** Root namespace type (lazy-init on first getNodeType call). */
let rootNamespaceType: INamespaceNodeType | undefined;

/**
 * Single global schema-load lock. Only one thread may drive schema loading at a
 * time; every other caller waits and consumes the cached result once it is
 * loaded. This avoids deadlocks where per-type locks would let multiple threads
 * hold different locks and wait on each other. The same thread may re-enter for
 * circular dependencies (it does not re-acquire / release the lock).
 */
const GLOBAL_LOAD_LOCK = "__GLOBAL_SCHEMA_LOAD__";
const lockLoad = new Map<string, string>();

/**
 * Deferred load tasks. Some associations (e.g. prototype properties mounted as
 * struct attach fields) only surface DURING loading and may form cycles: the
 * mount target is still mid-load, so the mount only sees a partial instance and
 * cannot complete. Such work is deferred and flushed by the outermost load
 * holder right before it releases the global lock — at that point every type in
 * the chain is fully loaded, so the mount can be retried to completion.
 */
const deferredLoadTasks: Array<(threadId?: string) => Promise<void>> = [];

/** Defer a load task until the current load chain's outermost call completes. */
export function deferLoadTask(task: (threadId?: string) => Promise<void>): void {
  deferredLoadTasks.push(task);
}

/** Run all deferred load tasks (and any they enqueue) sequentially. */
async function flushDeferredLoadTasks(threadId?: string): Promise<void> {
  while (deferredLoadTasks.length) {
    const tasks = deferredLoadTasks.splice(0, deferredLoadTasks.length);
    for (const task of tasks) {
      try { await task(threadId); }
      catch (error) { logger.error('[Load][Deferred] Task failed:', error); }
    }
  }
}

/** Get the cached NodeType type by full schema name. */
export function getCachedNodeType(fullName: string): INodeType | undefined {
  const split = splitString(fullName);
  if (!rootNamespaceType) {
    const runtime = getNodeTypeGenerator(NODE_KIND_NAMESPACE)!;
    rootNamespaceType = new runtime() as INamespaceNodeType;
  }

  let node: INodeType | undefined = rootNamespaceType;
  for (let i = 0; i < split.length; i++) {
    node = isNamespaceNodeType(node) ? node.getNodeType(split[i]) : undefined;
    if (!node) break;
  }
  return node;
}

/**
 * Resolve a runtime NodeType by full schema name.
 * 
 * Mirrors C# SchemaContext.GetNodeTypeAsync:
 *   1. Look up the NodeSchema by name from _schemaIndex
 *   2. Use _nodeTypeGenerator to find the NodeType class for the schema's kind
 *   3. Create the NodeType instance and call loadType()
 *
 * @param fullName   The dotted full schema name (e.g. "system.string")
 * @param generics   Optional generic parameter declarations
 * @param genericParams Optional resolved generic type arguments
 * @param reload     If true, forces re-loading from provider
 */
export async function getNodeType(
  fullName: string,
  generics?: GenericParameter[],
  genericParams?: INodeType[],
  reload?: boolean,
  threadId?: string
): Promise<INodeType | undefined> {
  fullName = (isNull(fullName) ? '' : fullName).toLowerCase().trim();
  threadId ??= crypto ? crypto.randomUUID() : generateGuid();

  // Generic type — the name matches a generic parameter → return the concrete type
  if (generics?.length) {
    const gIdx = generics.findIndex(g => g.name.toLowerCase() === fullName);
    if (gIdx >= 0) {
      if (genericParams && gIdx < genericParams.length)
        return genericParams[gIdx];
      const runtime = getNodeTypeGenerator(NODE_KIND_GENERIC)!;
      const compatibles = [];
      if (generics[gIdx].compatibles?.length)
      {
        for (const c of generics[gIdx].compatibles)
        {
          const type = await getNodeType(c, undefined, undefined, undefined, threadId);
          if (type) compatibles.push(type);
        }
      }
      return new (runtime as any)(generics[gIdx].name, compatibles);
    }
  }

  // Walk namespace segments
  let genericPart : string | undefined = undefined;
  if (fullName.endsWith('>'))
  {
    const genericStart = fullName.indexOf('<');
    if (genericStart < 0)
    {
      logger.error(`The "${fullName}" is not a valid type name.`)
      return undefined;
    }
    genericPart = fullName.substring(genericStart);
    fullName = fullName.substring(0, genericStart);
  }
  const parts = splitString(fullName);
  if (genericPart) parts.push(genericPart);

  // Load nodes
  if (!rootNamespaceType) {
    const runtime = getNodeTypeGenerator(NODE_KIND_NAMESPACE)!;
    rootNamespaceType = new runtime() as INamespaceNodeType;
  }
  let node: INodeType | undefined = rootNamespaceType;

  // Try loading cached types first
  for (let i = 0; i < parts.length; i++) {
    node = await loadNodeType(node, parts[i], generics, genericParams, reload, i + 1 == parts.length, true, threadId);
    if (!node) break;
  }

  // Try loading full namespace types if not cached
  if (!node?.loaded){
    node = await loadNodeType(rootNamespaceType!, '') as unknown as INodeType;
    if (parts?.length) {
      for (let i = 0; i < parts.length; i++) {
        node = await loadNodeType(node, parts[i], generics, genericParams, reload, i + 1 == parts.length, false, threadId);
        if (!node) break;
      }
    }
  }
  return node;
}

/** Load a single namespace segment. */
async function loadNodeType(
  parent: INodeType,
  segment: string,
  generics?: GenericParameter[],
  genericParams?: INodeType[],
  reload?: boolean,
  isLast?: boolean,
  onlyCache?: boolean, // to avoid loading full namespace if the cached schema provided in other ways, the frontend doesn't require full picture
  threadId?: string
): Promise<INodeType | undefined> {
  const nsParent = isNamespaceNodeType(parent) ? parent as INamespaceNodeType : undefined;
  let result: INodeType | undefined = nsParent;
  if (segment.length) {
    // Generic types: segment starts with '<', e.g. "list<system.string>"
    if (segment.startsWith('<')) return loadGenericType(parent, segment, generics, genericParams, threadId);
    result = nsParent?.getNodeType(segment);
  }

  // Already loaded?
  if (result)
  {
    if (isLast && reload) {
      result.loaded = false;
    }
    else if (result.loaded || !isLast && onlyCache) {
      return result;
    }
  }
  else if(reload || onlyCache)
  {
    return undefined; // reload only on existing types
  }

  // lock and load — a SINGLE global load lock. Only one thread may drive schema
  // loading at a time; all other threads wait and consume the cached result once
  // it is loaded. The same thread may re-enter for nested loads.
  const lockName = GLOBAL_LOAD_LOCK;
  const loadName = nsParent?.name && nsParent != result ? `${nsParent.name}.${segment}` : segment;

  // Re-entrant: this thread already holds the global lock. That happens for BOTH
  //   (a) circular dependency  — the target type is already cached mid-load; and
  //   (b) an ordinary nested load of a NEW type the chain touches for the first time.
  // Only (a) must short-circuit with the cached partial instance. For (b) result is
  // still undefined, so returning it would wrongly make an existing type unresolvable;
  // fall through and load it (without touching the lock held by the outer call).
  const reentrant = threadId !== undefined && lockLoad.get(lockName) === threadId;
  const circular = reentrant && segment.length > 0 && !!result && result !== nsParent;
  if (circular)
    return result;

  let acquiredLock = false;
  if (!reentrant && threadId) {
    // Wait for any other thread to finish its entire load chain.
    while (lockLoad.has(lockName)) {
      result ??= nsParent?.getNodeType(segment);
      if (result?.loaded) return result;
      await new Promise(resolve => setTimeout(resolve, 10));
      logger.verbose(`Thread ${threadId} is waiting for load lock ${loadName}`);
    }
    lockLoad.set(lockName, threadId);
    acquiredLock = true;
  }

  try
  {
    // Another thread may have finished loading this type right when the lock flipped;
    // consume it instead of loading twice. (finally releases the lock we acquired.)
    if (acquiredLock && segment.length) {
      const cached = nsParent?.getNodeType(segment);
      if (cached?.loaded) return cached;
      if (cached) result = cached;
    }

    // Load the NodeSchema
    const schema = await loadNodeSchema(nsParent, segment, reload);
    if (!schema) return undefined;

    // Resolve NodeType class from _nodeTypeGenerator
    const NodeTypeCtor = getNodeTypeGenerator(schema.kind) ?? getNodeTypeGenerator(SCHEMA_KIND_NODE)!;
    result ??= new NodeTypeCtor(nsParent);

    // Cache in parent namespace (strip sub-schemas first — they're saved separately)
    const { schemas, ...mainSchema } = schema;
    if (nsParent !== result) {
      nsParent?.saveSubNodeSchema(mainSchema, true, threadId);
      nsParent?.saveNodeType(segment, result);
    }

    // Load the type
    await result.loadType(mainSchema, undefined, threadId);

    // Save sub-schemas into NamespaceType
    if (isNamespaceNodeType(result) && schemas?.length)
      result.saveSubNodeSchema(schemas, false, threadId);

    // Generic types reloading (clone schema to avoid mutation)
    for (const g of result.getGenericTypes())
      await g.loadType({ ...mainSchema }, g.genericParams, threadId);
    return result;
  }
  finally{
    // Only release the lock if this call acquired it. An inner (re-entrant) call
    // for a circular dependency must NOT delete the lock held by the outer call.
    if (acquiredLock) {
      // Flush deferred load tasks while still holding the lock, so their nested
      // loads re-enter cleanly on this thread instead of competing for the lock.
      try { await flushDeferredLoadTasks(threadId); }
      finally { lockLoad.delete(lockName); }
    }
  }
}

/** Load a generic type like "list<system.string>". */
async function loadGenericType(
  node: INodeType,
  segment: string,
  generics?: GenericParameter[],
  genericParams?: INodeType[],
  threadId?: string
): Promise<INodeType | undefined> {
  let inner = segment.slice(1, -1); // strip '<' and '>'
  if (!node.generics) return undefined;

  // Check cache
  let genType = node.getGenericType(inner);
  if (genType && genType.loaded) return genType;

  // Parse generic params respecting nested <>, e.g. "system.point<system.int, system.number>"
  const genParams: INodeType[] = [];
  let isTemplate = false;
  for (const paramName of splitGenericParams(inner)) {
    if (generics?.length){
      const idx = generics.findIndex(g => g.name.toLowerCase() === paramName.toLowerCase());
      if (idx >= 0) {
        isTemplate = true;
        if (genericParams?.length && idx < genericParams.length) {
          genParams.push(genericParams[idx]);
          continue;
        }
      }
    }
    const resolved = await getNodeType(paramName, generics, genericParams, undefined, threadId);
    if (!resolved) return undefined;
    genParams.push(resolved);
  }
  if (isTemplate) return node; // template type, return self

  if (node.generics.length !== genParams.length) return undefined;
  inner = genParams.map(p => p.name).join(', ');

  genType = node.getGenericType(inner);
  if (genType && genType.loaded) return genType;

  // Re-entrant: same thread already holds the global load lock. Only treat it as a
  // circular dependency when the generic instance is ALREADY cached mid-load; if it
  // is not cached yet, this is the first time the chain builds this instance, so
  // continue and create it (do not return undefined).
  const reentrant = threadId !== undefined && lockLoad.get(GLOBAL_LOAD_LOCK) === threadId;
  if (reentrant && genType)
    return genType;

  let acquiredLock = false;
  if (!reentrant && threadId) {
    // Wait for any other thread to finish its entire load chain.
    while (lockLoad.has(GLOBAL_LOAD_LOCK)) {
      genType ??= node.getGenericType(inner);
      if (genType && genType.loaded) return genType;
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    lockLoad.set(GLOBAL_LOAD_LOCK, threadId);
    acquiredLock = true;
  }

  try{
    // Consume an instance another thread finished while the lock flipped. The
    // lock being released means its loadType completed, so it is fully loaded.
    if (acquiredLock) {
      const cached = node.getGenericType(inner);
      if (cached) return cached;
    }

    // Create generic type instance
    const NodeTypeCtor = node.constructor as new (parent?: INodeType) => INodeType;
    genType = new NodeTypeCtor(node.namespace);
    if (!isTemplate)
      node.setGenericType(inner, genType);

    // Load the type
    await genType.loadType(node.getNodeSchema()!, genParams, threadId);
    return genType;
  }
  finally{
    if (acquiredLock) {
      // Flush deferred load tasks while still holding the lock (see loadNodeType).
      try { await flushDeferredLoadTasks(threadId); }
      finally { lockLoad.delete(GLOBAL_LOAD_LOCK); }
    }
  }
}

/**
 * Load a NodeSchema — first from namespace cache, then system index, then providers.
 * Schemas from multiple providers are COMBINED (not replaced), mirroring C# merging logic.
 */
async function loadNodeSchema(
  ns: INamespaceNodeType | undefined,
  name: string,
  reload?: boolean,
): Promise<NodeSchema | undefined> {
  const schemaName = ns ? (name ? `${ns.name}.${name}`.replace(/^\./, '') : ns.name) : name;

  // 1. Check namespace cache (unless reloading)
  if (!reload && name.length) {
    const cachedNodeSchema = ns?.getSubNodeSchema(name);
    if (cachedNodeSchema && cachedNodeSchema.kind !== NODE_KIND_NAMESPACE) return cachedNodeSchema;
  }

  // 2. Try system (built-in) schema
  let schema = getSystemSchema(schemaName);

  // 3. Try loading from providers and combine
  const provider = getSchemaProvider();
  if (provider) {
    try {
      const loadSchema = await shareGetSchemaFromProvider(schemaName);
      if (!schema) {
        schema = loadSchema;
      }
      else if (loadSchema) {
        // Merge load states
        schema.loadState = (schema.loadState ?? SchemaLoadState.None) | (loadSchema.loadState ?? SchemaLoadState.None);

        // Combine properties on the schema itself
        combineProperties(schema, loadSchema, SCHEMA_KIND_NODE);

        // For namespace schemas, merge sub-schemas
        if (loadSchema.kind === NODE_KIND_NAMESPACE && loadSchema.schemas?.length) {
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
                  schema.schemas[existingIdx].loadState = (schema.schemas[existingIdx].loadState ?? SchemaLoadState.None) | (other.loadState ?? SchemaLoadState.None);
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
    } catch (error) {
      logger.error(`Failed to load schema from provider: ${schemaName}`, error);
    }
  }

  return schema;
}

async function getSchemaFromProvider(schemaName: string) {
  const provider = getSchemaProvider();
  if (provider) {
    try {
      const loadSchemas = await provider.getSchema([schemaName]);
      const loadSchema = getLoadSchema(loadSchemas, schemaName);
      if (loadSchema) updateSchemaState(loadSchema, SchemaLoadState.Service);
      return loadSchema;
    } catch (error) {
      logger.error(`Failed to load schema from provider: ${schemaName}`, error);
    }
  }
  return undefined;
}

const shareGetSchemaFromProvider = useShareQuery(getSchemaFromProvider, 1000);

/**
 * Split generic parameters respecting nested angle brackets.
 * Mirrors C# SpanReader.NextGenericParam().
 *
 * e.g. "system.string, system.point<system.int, system.number>"
 *   → ["system.string", "system.point<system.int, system.number>"]
 */
export function* splitGenericParams(input: string): Generator<string> {
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

/** Export the node schemas by full names, for frontend-only mode schema download(system schema ignored) */
export async function getExportNodeSchemas(fullNames: string[]): Promise<NodeSchema[]> {
  const result: NodeSchema[] = [];
  for (const fullName of fullNames) {
    const nodeType = await getNodeType(fullName);
    if (nodeType) { await exportNodeType(nodeType, result); }
  }
  return result;
}

/** Install the node schema and its references into the result array */
export async function exportNodeType(nodeType: INodeType, result: NodeSchema[]): Promise<void> {
  const schema = nodeType.getNodeSchema()!;
  if ((schema.loadState ?? 0) & SchemaLoadState.System) return; // no system schema

  const parents: INamespaceNodeType[] = [];
  let parent = nodeType.namespace;
  while (isNamespaceNodeType(parent)) {
    parents.unshift(parent);
    parent = parent.namespace;
  }

  // Install the schema tree
  for (const parent of parents) {
    let exist = result.find(r => r.name === parent.name);
    if (!exist) {
      exist = parent.getNodeSchema()!;
      exist.schemas ??= [];
      result.push(exist);
    }
    result = exist.schemas!;
  }

  // Install the node schema
  if (!result.find(r => r.name === nodeType.name)) {
    result.push(nodeType.getNodeSchema()!);
    if (hasNodeReferences(nodeType))
    for (let ref of (nodeType as unknown as INodeReference)!.getRefTypes())
    {
      exportNodeType(ref, result);
    }
  }
}

function getLoadSchema(schemas: NodeSchema[], schemaName: string)
{
  if (!schemaName) { // root schema
    return { name: "", kind: NODE_KIND_NAMESPACE, schemas: schemas };
  }

  for(let schema of schemas)
  {
    const name = getNodeSchemaName(schema);
    if (name === schemaName) return schema;
    if (schema.kind === NODE_KIND_NAMESPACE && schemaName.startsWith(name + ".") && schema.schemas?.length)
    {
      return getLoadSchema(schema.schemas, schemaName);
    }
  }
  return undefined;
}

function updateSchemaState(schema: NodeSchema, state: SchemaLoadState)
{
  schema.loadState ??= SchemaLoadState.None;
  if (getPropertyValue(schema, SystemDefined))
    schema.loadState |= SchemaLoadState.System;
  schema.loadState |= state;

  if (schema.kind === NODE_KIND_NAMESPACE && schema.schemas?.length)
    for(let s of schema.schemas)
      updateSchemaState(s, state);
}

// install
if (typeof window !== 'undefined') (window as unknown as Record<string, Function>)!.getNodeType = getNodeType;