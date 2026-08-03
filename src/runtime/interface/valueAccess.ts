import { IConstraintProperty, IProperty, PropertyCtor } from "../../property";
import { Entry } from "../../struct";
import { Observer } from "../../utility";
import { RelationType, ValueType } from "../type";

/** The value type access interface */
export interface IValueTypeAccess {
  /** Gets the access value type */
  getAccessValueType(path: string): ValueType | undefined;

  /** Gets the access entries */
  getAccessEntries(): Entry<string>[];

  /** Whether this node has access entries. */
  get hasAccessEntries(): boolean;
}

/** Objects that provide path-based value access. */
export interface IValueAccess {
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

export interface IRelationInfo {
  /** The relation owner */
  owner: IValueAccess;

  /** The relation types */
  relations: RelationType[];
}