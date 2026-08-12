import type { Entry } from "../struct/entry/type";
import type { IValueAccess } from "./valueAccess";
import type { IPropertyProvider } from "./propertyProvider";

/** The value type access interface */
export interface IValueTypeAccess {
  /** Gets the access value type */
  getAccessValueType(path: string): IValueTypeAccess | undefined;

  /** Gets the access entries */
  getAccessEntries(): Entry<string>[];

  /** Whether this node has access entries. */
  get hasAccessEntries(): boolean;
  
  /** Create a value access instance */
  create(value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider): IValueAccess;
}

/** The value access factory type */
export type ValueAccessFactory = new (type: IValueTypeAccess, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) => IValueAccess;