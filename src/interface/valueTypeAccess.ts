import type { Entry } from "../struct/entry/type";

/** The value type access interface */
export interface IValueTypeAccess {
  /** Gets the access value type */
  getAccessValueType(path: string): IValueTypeAccess | undefined;

  /** Gets the access entries */
  getAccessEntries(): Entry<string>[];

  /** Whether this node has access entries. */
  get hasAccessEntries(): boolean;
}