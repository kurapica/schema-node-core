import type { SchemaLoadState } from "../enum/schemaLoadState";
import type { GenericParameter } from "../schema/generic/type";
import type { NodeSchema } from "../schema/node/type";
import type { Entry } from "../struct/entry/type";
import type { Observer } from "../utility/observable";

// #region ── Value ───────────────────────────────────────────────────────────

/** The value type access interface */
export interface IValueTypeAccess extends IPropertyProvider {
  /** The type name */
  get name(): string;

  /** The type schema kind */
  get kind(): string;

  /** Gets the access value type */
  getAccessValueType(path: string): IValueTypeAccess | undefined;

  /** Gets the access entries */
  getAccessEntries(): Entry<string>[];

  /** Whether this node has access entries. */
  get hasAccessEntries(): boolean;

  /** Check whether this type is compatible with another (for assignment). */
  isAssignableTo(other: IValueTypeAccess): boolean;
  
  /** Create a value access instance */
  create(value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider): IValueAccess;
}

/** The array value type access interface */
export interface IArrayValueTypeAccess extends IValueTypeAccess {
  /** The array item type */
  get element(): IValueTypeAccess | undefined;
}

/** The value access factory type */
export type ValueAccessFactory = new (type: IValueTypeAccess, value: unknown, parent?: IValueAccess, ...propProviders: IPropertyProvider[]) => IValueAccess;

/** Objects that provide path-based value access. */
export interface IValueAccess {

  get type(): IValueTypeAccess;

  // #region ── Value Access ──────────────────────────────────────────────────

  /** The access path */
  get access(): string;
  
  /** Whether this node holds no value. */
  get isEmpty(): boolean;

  /** Gets the raw value to reduce the access cost */
  get rawValue(): unknown;

  /** The original value */
  get original(): unknown;

  /** Sets the value. */
  setValue(value: unknown): void;

  /** Gets the vlue. */
  getValue(): unknown;

  // #endregion

  // #region ── Property Access ───────────────────────────────────────────────

  /** Gets the property */
  getProperty(propCtor: PropertyCtor): IProperty | undefined;

  /** Gets the property value */
  getPropertyValue<T>(propCtor: PropertyCtor): T | undefined;

  /** Gets the properties */
  getProperties(propCtor: PropertyCtor): Generator<IProperty>;

  /** Gets the properties */
  getPropertyValues<T>(propCtor: PropertyCtor): Generator<T>;

  /** Sets the value of the given property from relations */
  setPropertyValue(propCtor: PropertyCtor, value?: unknown, source?: IValueAccess): void;

  // #endregion

  // #region ── Subscription ──────────────────────────────────────────────────

  /** Subscribe the data change and return the function for un-subsribe */
  subscribe(func: Observer<[IValueAccess, unknown]>, immediate?: boolean): Function;

  /** Record subscription by source */
  recordSubscription(subscription: Function, source: unknown): void;

  /** Clear subscriptions by souce */
  clearSubscription(source: unknown): void;

  // #endregion

  // #region ── Path Navigation ───────────────────────────────────────────────

  /**
   * Gets the access value
   * @param path The access path
   * @param node The accessed path must contains the node
   */
  getAccessValue(path: string, node?: IValueAccess): IValueAccess | undefined;

  /** The parent */
  get parent(): IValueAccess | undefined;

  // #endregion

  // #region ── Relation ──────────────────────────────────────────────────────

  /** Attach the relations */
  attachRelations(relationInfos: IRelationInfo[]): void;

  // #endregion

  // #region ── Validation ────────────────────────────────────────────────────

  /** Whether the value is valid */ 
  get isValid(): boolean | undefined;

  /** Gets the violated constraint properties */
  violated(): Generator<IConstraintProperty>;

  /** Record violated constraint property */
  recordConstraint(constraint: IConstraintProperty, valid: boolean): void;

  // #endregion
}

// #endregion

// #region ── Relation ───────────────────────────────────────────────────────────

/** The relation interface. */
export interface IRelation {
  
  /** The target property name */
  get target(): string;

  /** The property constructor */
  get propertyCtor(): PropertyCtor | undefined;

  /** Attach the relation to target with the owner */
  attach(owner: IValueAccess, target: IValueAccess): void;

  /** Detach the relation from the target with the owner */
  detach(owner: IValueAccess, target: IValueAccess): void;

  /** Execute the relation and set new property to the target */
  process(owner: IValueAccess, target: IValueAccess): Promise<void>;
}

export interface IRelationInfo {
  /** The relation owner */
  owner: IValueAccess;

  /** The relation types */
  relations: IRelation[];
}

/** The relations provider */
export interface IRelationProvider {
    /** Gets the relation types */
    getRelations(): Generator<IRelation>;
}

/** Check if the object is a relation provider */
export function isRelationProvider(obj: unknown): obj is IRelationProvider {
    // for simple
  return typeof (obj as any).getRelations === 'function'
}

/** Check if the object is a relation */
export function isRelation(obj: unknown): obj is IRelation
{
  return typeof (obj as any).attach === 'function' && 
    typeof (obj as any).detach === 'function' &&
    typeof (obj as any).process === 'function' &&
    (obj as any).target !== undefined && 
    (obj as any).propertyCtor !== undefined;
}

// #endregion

// #region ── Property ───────────────────────────────────────────────────────────

/**
 * Base interface for all property instances attached to a schema.
 */
export interface IProperty {
  /** Canonical property name, e.g. "upLimit", "require", "forSchema". */
  readonly name: string;

  /** Whether duplicates from different sources stack (accumulate) vs override. */
  readonly stackable: boolean;

  /** Whether the property is static, which means the property value cannot be modified by relation system. */
  readonly static: boolean;

  /** Whether the property carries a non-empty value. */
  readonly hasValue: boolean;

  /** Whether the property value is savable (persisted) in schema. */
  readonly savable: boolean;

  /** The source of the property value. */
  readonly source?: IValueAccess;

  /** Whether the property is applicable to the given schema kind. */
  forSchema(...kinds: string[]): boolean;

  /** Set the raw value onto this property instance. */
  setValue<T>(value: T): void;

  /** Get the typed value. If matchType is true, returns undefined on type mismatch. */
  getValue<T>(matchType?: boolean): T | undefined;

  /** Combine the value of another property into this one. */
  combine(other: IProperty): boolean;

  /** Compare this property to another for equality, used for stackable properties. */
  equal(other: IProperty): boolean;

  /** Apply the property to the target, or register the target, only works as a decorator. */
  apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void;

  /** Apply the property effect to the target. */
  effect(target: IValueAccess, newValue?: unknown, oldValue?: unknown, source?: IValueAccess): void;

  /** Clear the property effect from the target. */
  clear(target: IValueAccess, source?: IValueAccess): void;
}

/** The property constructor */
export type PropertyCtor<T extends IProperty = IProperty> = new (source?: IValueAccess) => T;

/**
 * Interface for constraint property components.
 * Each method returns:
 *   true  = valid
 *   false = invalid
 *   undefined/null = not applicable to this node type
 */
export interface IConstraintProperty extends IProperty {
  /** validate the data node */
  validate(node: IValueAccess): Promise<boolean | undefined>;

  /** The error message if the property is invalid. */
  error(node: IValueAccess): string | undefined;
}

/** Check if the property is constraint */
export function isConstraintProperty(prop: IProperty): prop is IConstraintProperty {
    // for simple
  return typeof (prop as any).validate === 'function'
}


/** Provider the properties */
export interface IPropertyProvider {
  /** Gets the property */
  getProperty<T extends IProperty>(propCtor: PropertyCtor | string): T | undefined;
  
  /** Gets the property value */
  getPropertyValue<T>(propCtor: PropertyCtor | string): T | undefined;

  /** Gets the properties */
  getProperties<T extends IProperty>(propCtor: PropertyCtor | string): Generator<T>;

  /** Gets the properties values */
  getPropertyValues<T>(propCtor: PropertyCtor | string): Generator<T>;

  /** Gets the properties with predicate */
  filterProperties(predicate: (prop: IProperty) => boolean): Generator<IProperty>;
}

/** Joins the properties from multiple providers. */
export function *joinProperties(...propertyProviders: (IteratorObject<IProperty> | Iterable<IProperty> | Generator<IProperty> | IProperty[] | undefined)[]): Generator<IProperty> {
  const types: Set<Function> = new Set();
  for (const propertyProvider of propertyProviders) {
    if (!propertyProvider) continue;
    for (const prop of propertyProvider)
    {
      if (prop.stackable) 
        yield prop;
      else
      {
        const type = prop.constructor;
        if (types.has(type)) continue;
        types.add(type);
        yield prop;
      }
    }
  }
}

// #endregion

// #region ── Error ───────────────────────────────────────────────────────────

/** The node error interface */
export interface IErrorProvider {
  error?: string;
}

// #endregion

// #region ── Node ───────────────────────────────────────────────────────────

/** The interface for all node types. */
export interface INodeType extends IPropertyProvider {
  /** The parent namespace (set once the type is loaded into a namespace). */
  get namespace(): INodeType | undefined;

  /** The loaded state flag. */
  loaded: boolean;

  /** Generic template parameters (declared on the schema). */
  get generics(): GenericParameter[] | undefined;

  /** Concrete generic type arguments (resolved at load time). */
  get genericParams(): INodeType[] | undefined;

  /** Full qualified name (namespace.name, may include generic params). */
  get name(): string;

  /** The type kind (e.g. ""enum", "struct", "workflow"). */
  get kind(): string;

  /** The error message (if any). */
  get error(): string | undefined;

  /** The load state. */
  get loadState(): SchemaLoadState;

  /** Get the backing NodeSchema. */
  getNodeSchema(): NodeSchema;

  /** Load the type from the schema. */
  loadType(schema: NodeSchema, genericParams?: INodeType[]): Promise<void>;

  // ── Generic Types ────────────────────────────────────────────────────
  /** Whether the type is generic */
  get isGeneric(): boolean;

  /** Get a cached generic type by key. */
  getGenericType(key: string): INodeType | undefined;

  /** Set a cached generic type by key. */
  setGenericType(key: string, type: INodeType): void;

  /** Get all cached generic types. */
  getGenericTypes(): INodeType[];

  // ── Used-by tracking ─────────────────────────────────────────────────

  /** Whether the type is generic */
  get isUsed(): boolean;

  /** Add a type that uses this type. */
  addUsedBy(type: INodeType): void;

  /** Remove a type that uses this type. */
  removeUsedBy(type: INodeType): void;
}

/** The interface for namespace node types. */
export interface INamespaceNodeType extends INodeType {

  // ── NodeType management ────────────────────────────────────────────────

  /** Save the node type */
  saveNodeType(name: string, type: INodeType): void;

  /** Gets the node type */
  getNodeType(name: string): INodeType | undefined;

  // ── NodeSchema management (for reload detection & provider merging) ─────

  /** Cache a NodeSchema keyed by name (used for reload detection). */
  saveSubNodeSchema(schema: NodeSchema | NodeSchema[], reload?: boolean): void;

  /** Remove a sub node schema */
  removeSubNodeSchema(name: string): void;

  /** Get a cached NodeSchema by name. */
  getSubNodeSchema(name: string): NodeSchema | undefined;

  /** Get all sub node schemas */
  getSubNodeSchemas(): Generator<NodeSchema>;
}

/** The node reference interface */
export interface INodeReference {
  getRefTypes(): Generator<INodeType>;
}

/** The object implements the INodeReference */
export function hasNodeReferences(obj: unknown): obj is INodeReference {
  return typeof (obj as any)?.getRefTypes === 'function'
}

/** The object implements the INamespaceNodeType */
export function isNamespaceNodeType(obj: unknown): obj is INamespaceNodeType {
  return typeof (obj as any)?.getNodeType === 'function'
}

// #endregion

// #region ── Access ───────────────────────────────────────────────────────────

/** The access path interface (temporary) */
export interface IAccessPathHandler {
  /** Get the access value type from the owner by path. */
  getAccessValueType(owner: IValueTypeAccess): IValueTypeAccess | undefined;

  /** Get the access value from the owner by path. */
  getAccessValue(owner: IValueAccess, node?: IValueAccess): IValueAccess | undefined;
}
// #endregion