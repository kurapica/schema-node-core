import { IProperty } from "../../property";
import { RelationType, ValueType } from "../type";

/** The value type access interface */
export interface IValueTypeAccess {
  /** Gets the access value type */
  getAccessValueType(path: string): ValueType | undefined;
}

/** Objects that provide path-based value access. */
export interface IValueAccess {
  // #region ── Value Access ──────────────────────────────────────────────────

  /** Whether this node holds no value. */
  get isEmpty(): boolean;

  /** Sets the value. */
  setValue(value: unknown): void;

  /** Gets the vlue. */
  getValue(): unknown;

  // #endregion

  // #region ── Property Access ───────────────────────────────────────────────

  /** Gets the property */
  getProperty(propCtor: new() => IProperty): IProperty | undefined;

  /** Gets the property value */
  getPropertyValue(propCtor: new() => IProperty): unknown;

  /** Gets the properties */
  getProperties(propCtor: new() => IProperty): Generator<IProperty>;

  /** Gets the properties */
  getPropertyValues(propCtor: new() => IProperty): Generator<unknown>;

  /** Sets the value of the given property from relations */
  setPropertyValue(propCtor: new () => IProperty, value?: unknown, source?: IValueAccess): void;

  // #endregion

  // #region ── Subscription ──────────────────────────────────────────────────

  /** Subscribe the data change and return the function for un-subsribe */
  subscribe(func: Function, immediate?: boolean): Function;

  /** Subscribe the node state changes(any property changed) and return the function for un-subscribe */
  subscribeState(func: Function, immediate?: boolean): Function;

  /** Subscribe the node property change and return the function for un-subscribe */
  subscribeProperty(propCtor: new() => IProperty, func: Function, immediate?: boolean): Function;

  /** Subscribe the violated constraints and return the function for un-subscribe */  
  subscribeViolated(func: Function, immediate?: boolean): Function;

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

  // #region ── Utility ───────────────────────────────────────────────────────

  /** Confirm the value */
  confirm(): void;

  /** Reset the value */
  reset(): void;

  /** Dispose the node */
  dispose(): void;

  /** Whether the value has changed */
  get changed(): boolean | undefined;

  /** Whether the value is valid */ 
  get isValid(): boolean | undefined;

  // #endregion
}

export interface IRelationInfo {
  /** The relation owner */
  owner: IValueAccess;

  /** The relation types */
  relations: RelationType[];
}