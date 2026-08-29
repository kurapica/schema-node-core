import { SchemaLoadState } from "../enum/schemaLoadState";
import { hasNodeReferences, isNamespaceNodeType } from "../interface";
import { combineProperties } from "../property/propertyOwner";
import { getSchemaProvider } from "../schema/provider";
import { getSchemaKindRegister, getSystemSchema } from "./schemaRuntime";

import type { INamespaceNodeType, INodeReference, INodeType } from "../interface";
import type { GenericParameter } from "../schema/generic/type";
import type { NodeSchema } from "../schema/node/type";

import { SCHEMA_KIND_GENERIC, SCHEMA_KIND_NAMESPACE, SCHEMA_KIND_NODE } from "../utility/constant";
import { logger } from "../utility/logger";
import { isNull } from "../utility/toolset";

const _nodeTypeGenerator = new Map<string, new (parent?: INodeType) => INodeType>();

/** Root namespace type (lazy-init on first getNodeType call). */
let rootNamespaceType: INamespaceNodeType | undefined;

function getRuntimeNodeType(kind: string){
  return (getSchemaKindRegister(kind)! as unknown as Record<string, new (parent?: INodeType) => INodeType>)?.runtimeNodeType
}

/** Get the cached NodeType type by full schema name. */
export function getCachedNodeType(fullName: string): INodeType | undefined {
  const split = fullName.split('.');
  if (!rootNamespaceType) {
    const runtime = getRuntimeNodeType(SCHEMA_KIND_NAMESPACE)!;
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
  reload = false,
): Promise<INodeType | undefined> {
  fullName = (isNull(fullName) ? '' : fullName).toLowerCase().trim();

  // Generic type — the name matches a generic parameter → return the concrete type
  if (generics?.length) {
    const gIdx = generics.findIndex(g => g.name.toLowerCase() === fullName);
    if (gIdx >= 0) {
      if (genericParams && gIdx < genericParams.length)
        return genericParams[gIdx];
      const runtime = getRuntimeNodeType(SCHEMA_KIND_GENERIC)!;
      const compatibles = [];
      if (generics[gIdx].compatibles?.length)
      {
        for (const c of generics[gIdx].compatibles)
        {
          const type = await getNodeType(c);
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
  const parts = fullName.split('.');
  if (genericPart) parts.push(genericPart);

  // Load nodes
  if (!rootNamespaceType) {
    const runtime = getRuntimeNodeType(SCHEMA_KIND_NAMESPACE)!;
    rootNamespaceType = new runtime() as INamespaceNodeType;
  }
  let node: INodeType | undefined = rootNamespaceType;

  // Try loading cached types first
  for (let i = 0; i < parts.length; i++) {
    node = await loadNodeType(node, parts[i], generics, genericParams, reload, i + 1 == parts.length, true);
    if (!node) break;
  }

  // Try loading full namespace types if not cached
  if (!node)
  {
    node = await loadNodeType(rootNamespaceType, '') as unknown as INodeType;
    for (let i = 0; i < parts.length; i++) {
      node = await loadNodeType(node, parts[i], generics, genericParams, reload, i + 1 == parts.length);
      if (!node) break;
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
  reload = false,
  isLast = false,
  onlyCache = false, // to avoid loading full namespace if the cached schema provided in other ways, the frontend doesn't require full picture
): Promise<INodeType | undefined> {
  const nsParent = isNamespaceNodeType(parent) ? parent as INamespaceNodeType : undefined;
  let result: INodeType | undefined = nsParent;
  if (segment.length) {
    // Generic types: segment starts with '<', e.g. "list<system.string>"
    if (segment.startsWith('<')) return loadGenericType(parent, segment, generics, genericParams);
    result = nsParent?.getNodeType(segment);
  }

  // Already loaded?
  if (result)
  {
    if (isLast && reload) {
      result.loaded = false;
    }
    else if (result.loaded || !isLast && onlyCache)
      return result;
  }
  else if(reload)
  {
    return undefined; // reload only on existing types
  }

  // Load the NodeSchema
  const schema = await loadNodeSchema(nsParent, segment, reload);
  if (!schema) return undefined;

  // Resolve NodeType class from _nodeTypeGenerator
  const NodeTypeCtor = getRuntimeNodeType(schema.kind) ?? getRuntimeNodeType(SCHEMA_KIND_NODE)!;
  result ??= new NodeTypeCtor(nsParent);

  // Cache in parent namespace (strip sub-schemas first — they're saved separately)
  const schemas = schema.schemas;
  delete schema.schemas;
  if (nsParent !== result) {
    nsParent?.saveSubNodeSchema(schema, true);
    nsParent?.saveNodeType(segment, result);
  }

  // Load the type
  await result.loadType(schema);

  // Save sub-schemas into NamespaceType
  if (isNamespaceNodeType(result) && schemas?.length)
    result.saveSubNodeSchema(schemas);

  // Generic types reloading (clone schema to avoid mutation)
  for (const g of result.getGenericTypes())
    await g.loadType({ ...schema }, g.genericParams);
  return result;
}

/** Load a generic type like "list<system.string>". */
async function loadGenericType(
  node: INodeType,
  segment: string,
  generics?: GenericParameter[],
  genericParams?: INodeType[],
): Promise<INodeType | undefined> {
  const inner = segment.slice(1, -1); // strip '<' and '>'
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
    const resolved = await getNodeType(paramName, generics, genericParams);
    if (!resolved) return undefined;
    genParams.push(resolved);
  }

  if (node.generics.length !== genParams.length) return undefined;

  // Create generic type instance
  const NodeTypeCtor = node.constructor as new (parent?: INodeType) => INodeType;
  genType = new NodeTypeCtor(node.namespace);
  if (!isTemplate)
    node.setGenericType(inner, genType);

  await genType.loadType(node.getNodeSchema()!, genParams);
  return genType;
}

/**
 * Load a NodeSchema — first from namespace cache, then system index, then providers.
 * Schemas from multiple providers are COMBINED (not replaced), mirroring C# merging logic.
 */
async function loadNodeSchema(
  ns: INamespaceNodeType | undefined,
  name: string,
  reload = false,
): Promise<NodeSchema | undefined> {
  const schemaName = ns ? (name ? `${ns.name}.${name}`.replace(/^\./, '') : ns.name) : name;

  // 1. Check namespace cache (unless reloading)
  if (!reload && name.length) {
    const cachedNodeSchema = ns?.getSubNodeSchema(name);
    if (cachedNodeSchema && cachedNodeSchema.kind !== SCHEMA_KIND_NAMESPACE) return cachedNodeSchema;
  }

  // 2. Try system (built-in) schema
  let schema = getSystemSchema(schemaName);

  // 3. Try loading from providers and combine
  const provider = getSchemaProvider();
  if (provider) {
    try {
      const loadSchemas = await provider.getSchema([schemaName]);
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
    } catch (error) {
      console.error(`Failed to load schema from provider: ${schemaName}`, error);
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

// install
if (window) (window as unknown as Record<string, Function>)!.getNodeType = getNodeType;