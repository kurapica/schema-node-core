import { Disable } from "../../property/common/disable";
import { combineProperties, getPropertyValue } from "../../property/propertyOwner";
import { isEqual, isNull } from "../../utility/toolset";

import type { Entry, EntryAccess } from "./type";

import { SCHEMA_KIND_ENTRY } from "../../utility/constant";

/** The runtime entry  */
export class EntryType<T> implements Entry<T> {
  /** The value of the entry */
  value!: T;

  /** Has children entries */
  hasChildren: boolean = false;

  /** The entry as a plain object */
  private _entry?: Entry<T>;

  /** The children entries of the entry */
  private _children?: EntryType<T>[];

  /** The parent of the enum value */
  private _parent?: EntryType<T>;

  /** The value map */
  private _valueMaps?: Map<T, EntryType<T>>;

  /** The entry is root */
  get isRoot() { return !this._parent };

  /** The entry is fully loaded */
  private _isFullyLoaded?: boolean;
  get isFullyLoaded() { return this._isFullyLoaded ?? false }

  /** The entry is disabled */
  get disabled() { return getPropertyValue(this._entry, Disable) ?? false }

  /** Gets the entry as a plain object */
  get entry(): Entry<T> {
    const entry = { value: this.value, hasChildren: this.hasChildren };
    combineProperties(entry, this._entry, SCHEMA_KIND_ENTRY);
    return entry;
  }

  /** Gets the child entry by value */
  getEntry(value: T | null | undefined): EntryType<T> | undefined {
    value = (typeof(value) === 'string' ? value.toLowerCase() : value) as T; // case ignore
    const entry = isNull(value) ? (this.isRoot ? this : undefined) : this._valueMaps?.get(value!);
    return entry && this.isDescendant(entry) ? entry : undefined;
  }

  /** Gets the entry access list if fully loaded */
  getAccessList(value: T | null | undefined): EntryAccess<T>[] | undefined {
    let entry: EntryType<T> | undefined = isNull(value) ? this : this.getEntry(value);
    if (!entry || entry.hasChildren && !entry._children?.length) return undefined;

    // build entry access list
    const accesses: EntryAccess<T>[] = [];
    let inBranch = false;
    while (entry)
    {
      accesses.unshift({
        entry: !entry.isRoot ? entry.entry : undefined,
        children: entry._children?.map(c => c.entry)
      });
      if (entry == this)
      {
        inBranch = true;
        break;
      }
      entry = entry._parent;
    }
    if (!inBranch) return undefined;
    return accesses;
  }

  /** Save the access list */
  saveAccessList(accesses: EntryAccess<T>[]): void
  {
    this._valueMaps ??= new Map();
    let root: EntryType<T> | undefined = this;

    for(let current of accesses)
    {
      root = root?.getEntry(current.entry?.value);
      if (!root) return;

      // replace
      root._children?.forEach(c => c.unregister());
      root._children = current.children?.map(c => {
        const entry = new EntryType<T>();
        entry.value = c.value;
        entry.hasChildren = c.hasChildren;
        entry._entry = c;
        entry._parent = root;
        entry._valueMaps = this._valueMaps;
        entry._children = root?._children?.find(e => isEqual(c.value, e.value))?._children;
        entry.register();
        return entry;
      })
    }

    // update load state
    while (root._parent) root = root?._parent;
    root.updateLoadState();
  }

  /** Whether the given entry is a descendant */
  isDescendant(desc: EntryType<T>): boolean {
    while (desc._parent && desc._parent != this) desc = desc._parent;
    return desc._parent === this;
  }

  /** Drop the children entries */
  dropChildren(): void {
    this._children?.forEach(c => c.unregister());
    this._children = undefined;
    this.hasChildren = false;
  }

  /** Drop the entry */
  drop(): void {
    if (this._parent) {
      this._parent._children = this._parent._children?.filter(c => c !== this);
      if (!this._parent._children?.length)
      {
        if (this._parent.disabled)
          this._parent.drop();
        else
          this._parent.dropChildren();
      }
    }
    this.unregister();
  }

  /** Refresh the loading state */
  private updateLoadState(): void {
    if (this._children?.length)
    {
      for (let child of this._children)
        child.updateLoadState();
      this._isFullyLoaded = !this._children.some(c => !c.isFullyLoaded);
    }
    else
    {
      this._isFullyLoaded = !this.hasChildren;
    }
  }

  /** remove this from value map */
  private unregister(): void  {
    const v = (typeof (this.value) === 'string' ? this.value.toLowerCase() : this.value) as T;
    this._valueMaps?.delete(v);
    this._children?.forEach(c => c.unregister());
    delete this._valueMaps;
    delete this._parent;
  }

  /** register this to the value map */
  private register(): void {
    const v = (typeof (this.value) === 'string' ? this.value.toLowerCase() : this.value) as T;
    this._valueMaps?.set(v, this);
    this._children?.forEach(c => {
      c._valueMaps = this._valueMaps;
      c._parent = this;
      c.register();
    })
  }
}