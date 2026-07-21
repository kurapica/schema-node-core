import { IProperty } from "../../property";
import { ValueType } from "../type";

/** The value type access interface */
export interface IValueTypeAccess {
  /** Gets the access value type */
  getAccessValueType(path: string): ValueType | undefined;
}

/** Objects that provide path-based value access. */
export interface IValueAccess {
  /**
   * Gets the access value
   * @param path The access path
   * @param node The accessed path must contains the node
   */
  getAccessValue(path: string, node?: IValueAccess): IValueAccess | undefined;

  /** Whether this node holds no value. */
  get isEmpty(): boolean;

  /** Sets the value. */
  setValue(value: unknown): void;

  /** Gets the vlue. */
  getValue(): unknown;

  /** The parent */
  get parent(): IValueAccess | undefined;

  /** Gets the property */
  getProperty(propCtor: new() => IProperty): IProperty | undefined;

  /** Gets the property value */
  getPropertyValue(propCtor: new() => IProperty): unknown;

  /** Gets the properties */
  getProperties(propCtor: new() => IProperty): Generator<IProperty>;

  /** Gets the properties */
  getPropertyValues(propCtor: new() => IProperty): Generator<unknown>;

  /** Sets the property */
  setProperty(property: IProperty, source?: IValueAccess): void;

  /** Sets the value of the given property */
  setPropertyValue(propCtor: new () => IProperty, value?: unknown, source?: IValueAccess): void;

  /** Subscribe the data change and return the function for un-subsribe */
  subscribe(func: Function, immediate?: boolean): Function;

  /** Subscribe the node state changes(any property changed) and return the function for un-subscribe */
  subscribeState(func: Function, immediate?: boolean): Function;

  /** Subscribe the node property change and return the function for un-subscribe */
  subscribeProperty(propCtor: new() => IProperty, func: Function, immediate?: boolean): Function;

  /** Record subscription by source */
  recordSubscription(subscription: Function, source: unknown): void;

  /** Clear subscriptions by souce */
  clearSubscription(source: unknown): void;
}