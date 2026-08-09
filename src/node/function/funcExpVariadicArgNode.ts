export class FuncExpVariadicArgNode extends StructNode implements Iterable<IValueAccess> {
  // #region ── ctor & dtor ───────────────────────────────────────────────────

  /** The arguments */
  readonly args: DataNode[];

  constructor(type: StructType, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, value, parent, propProvider);
    this.args = [];
  }
  // #endregion
}