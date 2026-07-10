// =============================================================================
// NodeType — abstract base for all runtime types
// Mirrors C# SchemaNode.Core/Runtime/Type/NodeType.cs
//
// Each NodeType wraps a NodeSchema loaded from the runtime.
// Provides schema-level introspection: kind, name, generics, property access.
// =============================================================================

import type { NodeSchema } from '../../schema/nodeSchema';
import type { IProperty } from '../../property/property';
import type { GenericParameter } from '../../property/core/generics';
import { getProperty, getProperties } from '../../property/propertyOwner';
import { combinePaths } from '../../utility/toolset';

export class NodeType {
  /** The parent namespace (set once the type is loaded into a namespace). */
  namespace?: NodeType;

  /** The backing NodeSchema — set during loadTypeAsync. */
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

  /** The schema kind. */
  get kind(): string { return this.schema?.kind ?? ''; }

  /** Schema error status. */
  get error(): string | undefined { return this.schema?.error; }

  // ── Schema ──────────────────────────────────────────────────────────

  /** Get the underlying NodeSchema (available after loadTypeAsync). */
  getNodeSchema(): NodeSchema | undefined { return this.schema; }

  /** Load type-specific data from the NodeSchema. Subclasses override. */
  async loadTypeAsync(schema: NodeSchema, genericParams?: NodeType[]): Promise<void> {
    this.schema = schema;
    this.genericParams = genericParams;

    // Load generics from the FuncProperty's FunctionSchema (if available)
    const funcProp = getProperty(schema, this._resolveFuncProp) as IProperty | undefined;
    if (funcProp?.hasValue) {
      const funcSchema = funcProp.getValue<{ generic?: GenericParameter[] }>();
      if (funcSchema?.generic) this.generics = funcSchema.generic;
    }

    this.loaded = true;
  }

  // private — will be overridden by FuncProperty reference
  private _resolveFuncProp?: new () => IProperty;

  // ── Property Access ──────────────────────────────────────────────────

  /** Get a single property from the NodeSchema. */
  getProperty<T extends IProperty>(propCtor: new () => T): T | undefined {
    return getProperty(this.schema, propCtor) as T | undefined;
  }

  /** Get stacked property values. */
  getProperties<T extends IProperty>(propCtor: new () => T): T[] {
    return getProperties(this.schema, propCtor) as T[];
  }

  /** Get all properties from the schema (cached). */
  getAllProperties(): IProperty[] {
    if (!this._props && this.schema) {
      // Collect from all schema kind properties
      this._props = [];
      // This will be populated by the runtime
    }
    return this._props ?? [];
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
  get isUsed(): boolean {
    return (this._usedBy?.size ?? 0) > 0;
  }

  /** Record that another type references this one. */
  addUsedBy(type: NodeType): void {
    if (!this._usedBy) this._usedBy = new Set();
    this._usedBy.add(type);
  }
}
