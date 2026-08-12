import { RelationStage } from "../enum/relationStage";
import type { Observer } from "../utility/observable";
import type { IValueTypeAccess } from "./valueTypeAccess";

/** Objects that provide path-based value access. */
export interface IValueAccess {
  get type(): IValueTypeAccess;

  // #region ── Value Access ──────────────────────────────────────────────────

  /** Whether this node holds no value. */
  get isEmpty(): boolean;

  /** Gets the raw value to reduce the access cost */
  get rawValue(): unknown;

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

  /** Gets the property value source */
  getPropertySource(propCtor: PropertyCtor): IValueAccess;

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
}

/** The property constructor */
export type PropertyCtor<T extends IProperty = IProperty> = new () => T;

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

/** The relation interface. */
export interface IRelation {
  
  get target(): string;

  get propertyCtor(): PropertyCtor | undefined;

  get stage(): RelationStage;

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

/** Check if the property is constraint */
export function isConstraintProperty(prop: IProperty): prop is IConstraintProperty {
    // for simple
  return typeof (prop as any).validate === 'function'
}
