// =============================================================================
// NodeType — abstract base for all runtime types
// Mirrors C# SchemaNode.Core/Runtime/Type/NodeType.cs
//
// Each NodeType wraps a NodeSchema loaded from the runtime.
// Provides schema-level introspection: kind, name, generics, property access.
// =============================================================================
import type { IProperty, PropertyCtor, IPropertyProvider, INodeReference, INodeType } from '../../interface';
import { type GenericParameter } from  '../../schema/generic/type';
import { getPropertiesBySchemaKind } from '../../property/propertyOwner';
import { combinePaths, deepClone } from '../../utility/toolset';
import { SCHEMA_KIND_NODE } from '../../utility/constant';
import { SchemaLoadState } from '../../enum/schemaLoadState';
import type { NodeSchema } from './type';
import { isTypeRefProperty, type ITypeRefProperty } from '../../property/typeRefProperty';
import { Generics } from '../generic/property';
import { getNodeType } from '../../runtime/context';

export class NodeType implements INodeType, IPropertyProvider, INodeReference {
  /** The parent namespace (set once the type is loaded into a namespace). */
  private _namespace?: INodeType;
  get namespace(): INodeType | undefined { return this._namespace; }

  /** The backing NodeSchema — set during loadType. */
  protected schema?: NodeSchema;

  /** The loaded state flag. */
  loaded = false;

  /** Generic template parameters (declared on the schema). */
  private _generics?: GenericParameter[];
  get generics(): GenericParameter[] | undefined { return this._generics; }

  /** Concrete generic type arguments (resolved at load time). */
  private _genericParams?: INodeType[];
  get genericParams(): INodeType[] | undefined { return this._genericParams; }

  // Generic type cache
  private _genericMap?: Map<string, INodeType>;

  // Property cache
  private _props?: IProperty[];

  // Refences types
  private _refTypes?: INodeType[];

  // Used-by tracking
  private _usedBy?: Set<INodeType>;

  constructor(parent?: INodeType) {
    this._namespace = parent;
  }

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

  /** The schema kind. */
  get kind(): string { return this.schema?.kind ?? SCHEMA_KIND_NODE; }

  /** Schema error status. */
  get error(): string | undefined { return this.schema?.error; }

  /** The schema load state */
  get loadState(): SchemaLoadState { return this.schema?.loadState ?? SchemaLoadState.None; }

  /** Whether the type is generic */
  get isGeneric(): boolean { return !this._genericParams?.length && this._generics?.length ? true : false }

  // ── Schema ──────────────────────────────────────────────────────────

  /** Get the underlying NodeSchema (available after loadType). */
  getNodeSchema(): NodeSchema { const { schemas, ...rest } = this.schema ?? {}; return deepClone(rest) as unknown as NodeSchema; }

  /** Load type-specific data from the NodeSchema. Subclasses override. */
  async loadType(schema: NodeSchema, genericParams?: INodeType[]): Promise<void> {
    this.unloadType();

    this.schema = schema;
    this._genericParams = genericParams?.length ? genericParams : undefined;
    this.loaded = true;

    // load properties
    this._props = Array.from(getPropertiesBySchemaKind(schema, SCHEMA_KIND_NODE)).concat(this.loadProperties());

    // Generic check
    this._generics = this.getProperty(Generics)?.getValue();
    
    // load ref types from properties
    this._refTypes = [];
    if (!genericParams?.length){
      for(let prop of this._props.filter(isTypeRefProperty))
      {
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
    this.unload();
    this._props = undefined;
    this._refTypes = undefined;
  }

  // ── Virtual ──────────────────────────────────────────────────────────

  /** load the schema data, should be overriden by the sub class */
  async load() {}

  /** Release the features when unload */
  unload(): void {}

  /** load the node schema kind properties */
  loadProperties(): IProperty[] { return [] }

  // ── Node Reference ───────────────────────────────────────────────────
  /** Gets the references types */
  *getRefTypes(): Generator<INodeType> {
    if (!this._refTypes?.length) return;
    yield* this._refTypes;
  }

  // ── Property Access ──────────────────────────────────────────────────

  /** Get a single property from the NodeSchema. */
  getProperty<T extends IProperty>(propCtor: PropertyCtor | string): T | undefined {
    return (typeof propCtor === 'string')
      ? this._props?.find(p => p.name.toLowerCase() === propCtor.toLowerCase()) as T
      : this._props?.find(p => p instanceof propCtor) as T;
  }

  /** Get stacked property values. */
  *getProperties<T extends IProperty>(propCtor: PropertyCtor | string): Generator<T> {
    if (this._props)
    {
      for(let prop of this._props)
      {
        if (typeof propCtor === 'string' ? prop.name.toLowerCase() === propCtor.toLowerCase() : prop instanceof propCtor)
        {
          yield prop as T;
          if (!prop.stackable) return;
        }
      }
    }
  }

  /** Filter properties by predicate */
  *filterProperties(predicate: (prop: IProperty) => boolean): Generator<IProperty> {
    if (!this._props?.length) return;
    for(let prop of this._props)
    {
      if (predicate(prop))
        yield prop;
    }
  }

  // ── Generic Types ────────────────────────────────────────────────────

  /** Get a cached generic type by key. */
  getGenericType(key: string): INodeType | undefined {
    return this._genericMap?.get(key);
  }

  /** Cache a generic type. */
  setGenericType(key: string, type: INodeType): void {
    if (!this._genericMap) this._genericMap = new Map();
    this._genericMap.set(key, type);
  }

  /** Get all cached generic types. */
  getGenericTypes(): INodeType[] {
    return this._genericMap ? [...this._genericMap.values()] : [];
  }

  // ── Used-by tracking ─────────────────────────────────────────────────

  /** Whether this type is referenced by any other type. */
  get isUsed(): boolean { return (this._usedBy?.size ?? 0) > 0; }

  /** Record that another type references this one. */
  addUsedBy(type: INodeType): void {
    if (!this._usedBy) this._usedBy = new Set();
    this._usedBy.add(type);
  }

  /** Remove the used by type reference */
  removeUsedBy(type: INodeType): void {
    this._usedBy?.delete(type);
  }
}
