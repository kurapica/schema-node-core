// =============================================================================
// IRuntime Interfaces — shared interfaces used across Node/Runtime layers
// =============================================================================

import type { DataNode } from '../node/dataNode';
import { IProperty } from '../property';
import { NodeType, ValueType } from './type';

/** The node reference interface */
export interface INodeReference {
  getRefTypes(): Generator<NodeType>;
}

/** The node error interface */
export interface IErrorProvider {
  error?: string;
}

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

  /** Try to set a typed value. Returns true on success. */
  trySetValue<T>(value: T): boolean;

  /** Try to get the value as a specific type. */
  getValue<T>(): T | undefined;

  /** The parent */
  get Parent(): IValueAccess | undefined;

  /** Gets the property */
  getProperty(propCtor: new() => IProperty): IProperty | undefined;

  /** Gets the properties */
  getProperties(propCtor: new() => IProperty): IProperty[];

  /** Sets the property */
  setProperty(property: IProperty): void;

  /** Sets the value of the given property */
  setPropertyValue(propCtor: new () => IProperty, value?: unknown): void;

  /** Override the property with owner */
  overrideProperty(owner: IValueAccess, property: IProperty): void;

  /** Overrie the value of the given property with owner */
  overridePropertyValue(owner: IValueAccess, propCtor: new () => IProperty, value?: unknown): void;

  /** Subscribe the data change and return the function for un-subsribe */
  subscribe(func: Function, immediate?: boolean): Function;

  /** Subscribe the node state changes(any property changed) and return the function for un-subscribe */
  subscribeState(func: Function, immediate?: boolean): Function;

  /** Subscribe the node property change and return the function for un-subscribe */
  subscribeProperty(func: Function, propCtor: new() => IProperty, immediate?: boolean): Function;

  /** Record subscription by source */
  recordSubscription(source: unknown, subscription: Function): void;

  /** Clear subscriptions by souce */
  clearSubscription(source: unknown): void;
}

/** The object implements the INodeReference */
export function hasNodeReferences(obj: unknown){
  return typeof (obj as any)?.getRefTypes === 'function'
}