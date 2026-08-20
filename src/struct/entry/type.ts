/** The entry interface */
export interface Entry<T> {
    /** The entry value */
    value: T;

    /** Whether has child entries */
    hasChildren: boolean;

    /** The children entries of the <see cref='entry'> */
    children?: Entry<T>[];
}

/** The entry access interface */
export interface EntryAccess<T> {
  /** The entry in the path */
  entry?: Entry<T>;

  /** The children entries of the <see cref='entry'> */
  children?: Entry<T>[];
}
