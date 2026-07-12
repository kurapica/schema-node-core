// =============================================================================
// NodeType — abstract base for all runtime types
// Mirrors C# SchemaNode.Core/Runtime/Type/NodeType.cs
//
// Each NodeType wraps a NodeSchema loaded from the runtime.
// Provides schema-level introspection: kind, name, generics, property access.
// =============================================================================

import type { NodeSchema } from '../../schema/nodeSchema';
import type { IProperty, ITypeRefProperty } from '../../property/property';
import type { GenericParameter } from '../../property/core/generics';
import { getProperty, getProperties, getPropertiesBySchemaKind } from '../../property/propertyOwner';
import { combinePaths } from '../../utility/toolset';
import { SCHEMA_KIND_NODE } from '../../utility/constant';
import { SchemaLoadState } from '../../enum/schemaLoadState';
import { getNodeType, getPropertyForSchemas } from '../schemaRuntime';

export class NodeType {
  /** The parent namespace (set once the type is loaded into a namespace). */
  namespace?: NodeType;

  /** The backing NodeSchema — set during loadType. */
  protected schema?: NodeSchema;

  /** The loaded state flag. */
  loaded = false;

  /** Generic template parameters (declared on the schema). */
  generics?: GenericParameter[];

  /** Concrete generic type arguments (resolved at load time). */
  genericParams?: NodeType[];

  // Generic type cache
  private _genericMap?: Map<string, NodeType>;

  // Property cache
  private _props?: IProperty[];

  // Refences types
  private _refTypes?: NodeType[];

  // Used-by tracking
  private _usedBy?: Set<NodeType>;

  // ── Identity ────────────────────────────────────────────────────────

  /** Full qualified name (namespace.name, may include generic params). */
  get name(): string {
    if (!this.schema) return '';
    const baseName = combinePaths(this.schema.namespace ?? '', this.schema.name);
    if (this.genericParams && this.genericParams.length > 0) {
      return `${baseName}<${this.genericParams.map(g => g.name).join(', ')}>`;
    }
    return baseName;
  }

  /** Gets the properties */
  get properties(): IProperty[] { return this._props ?? []; }

  /** The schema kind. */
  get kind(): string { return this.schema?.kind ?? SCHEMA_KIND_NODE; }

  /** Schema error status. */
  get error(): string | undefined { return this.schema?.error; }

  /** The schema load state */
  get loadState(): SchemaLoadState | undefined { return this.schema?.loadState; }

  /** Whether the type is generic */
  get isGeneric(): boolean { return !this.genericParams?.length && this.generics?.length ? true : false }

  // ── Schema ──────────────────────────────────────────────────────────

  /** Get the underlying NodeSchema (available after loadType). */
  getNodeSchema(): NodeSchema | undefined { const { schemas, ...rest } = this.schema ?? {}; return rest as unknown as NodeSchema; }

  /** Load type-specific data from the NodeSchema. Subclasses override. */
  async loadType(schema: NodeSchema, genericParams?: NodeType[]): Promise<void> {
    this.unloadType();

    this.schema = schema;
    this.genericParams = genericParams?.length ? genericParams : undefined;
    this.loaded = true;

    // load properties
    this._props = getPropertiesBySchemaKind(schema, SCHEMA_KIND_NODE).concat(this.loadProperties());
    
    // load ref types from properties
    this._refTypes = [];
    if (!genericParams?.length){
      for(let i = 0; i < this._props.length; i++)
      {
        const prop = this._props[i];
        if (typeof (prop as any).getRefTypes !== 'function') continue;

        for(let type of (prop as ITypeRefProperty).getRefTypes())
        {
          const nodeType = await getNodeType(type);
          if (nodeType && !this._refTypes.includes(nodeType)) 
            this._refTypes.push(nodeType);
        }
      }
    }

    // load schema specific data
    await this.load();

    // register used by
    if (genericParams?.length)
    {
      genericParams.forEach(g => g.addUsedBy(this));
    }
    else
    {
      this._refTypes.forEach(g => g.addUsedBy(this));
    }
  }

  /** Unload types */
  unloadType(): void {
    if (this.genericParams?.length)
      this.genericParams.forEach(g => g.removeUsedBy(this));
    else
      this.getRefTypes().forEach(g => g.removeUsedBy(this));
  }

  // ── Virtual ──────────────────────────────────────────────────────────

  /** load the schema data, should be overriden by the sub class */
  async load() {}

  /** Release the features when unload */
  unload(): void {}

  /** load the node schema kind properties */
  loadProperties(): IProperty[] { return [] }

  /** Gets the references types */
  getRefTypes(): NodeType[] { return this._refTypes ? [...this._refTypes] : []; }

  // ── Property Access ──────────────────────────────────────────────────

  /** Get a single property from the NodeSchema. */
  getProperty<T extends IProperty>(propCtor: new () => T): T | undefined {
    return this._props?.find(p => p instanceof propCtor) as T;
  }

  /** Get stacked property values. */
  getProperties<T extends IProperty>(propCtor: new () => T): T[] {
    return this._props?.filter(p => p instanceof propCtor) as T[] ?? [];
  }

  // ── Generic Types ────────────────────────────────────────────────────

  /** Get a cached generic type by key. */
  getGenericType(key: string): NodeType | undefined {
    return this._genericMap?.get(key);
  }

  /** Cache a generic type. */
  setGenericType(key: string, type: NodeType): void {
    if (!this._genericMap) this._genericMap = new Map();
    this._genericMap.set(key, type);
  }

  /** Get all cached generic types. */
  getGenericTypes(): NodeType[] {
    return this._genericMap ? [...this._genericMap.values()] : [];
  }

  // ── Used-by tracking ─────────────────────────────────────────────────

  /** Whether this type is referenced by any other type. */
  get isUsed(): boolean { return (this._usedBy?.size ?? 0) > 0; }

  /** Record that another type references this one. */
  addUsedBy(type: NodeType): void {
    if (!this._usedBy) this._usedBy = new Set();
    this._usedBy.add(type);
  }

  /** Remove the used by type reference */
  removeUsedBy(type: NodeType): void {
    this._usedBy?.delete(type);
  }
}
