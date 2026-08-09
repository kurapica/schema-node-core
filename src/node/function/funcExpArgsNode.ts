
/** The function expression arguments data node */
export class FunExpArgsNode extends StructNode implements Iterable<IValueAccess> {
  // #region ── ctor & dtor ───────────────────────────────────────────────────

  /** The arguments */
  readonly args: DataNode[];

  constructor(type: FunctionType, value: CallArg[] | unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    // construct temp struct type

    super(type, undefined, parent, propProvider);
    this.args = [];
  }
  // #endregion

  // #region ── Value Access ──────────────────────────────────────────────────

  // #endregion

  // #region ── Iterable ──────────────────────────────────────────────────────
  /** The iterator for the arguments */
  [Symbol.iterator](): Iterator<IValueAccess> {
    return this.args[Symbol.iterator]();
  }

  forEach(callback: (value: IValueAccess, index: number) => void): void {
    this._fields.forEach(callback);
  }

  map<T>(callback: (value: IValueAccess, index: number) => T): T[] {
    return this._fields.map(callback);
  }

  // #endregion
}