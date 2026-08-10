import { ExpType } from "../../enum";
import { IValueAccess, IPropertyProvider, FunctionType, ArrayType, ValueType } from "../../runtime";
import { CallArg } from "../../schema";
import { isNull, NODE_SELF, NODE_TYPE } from "../../utility";
import { DataNode } from "../dataNode";
import { FuncExpArgNode } from "./funcExpArgNode";
import { FuncExpVariadicArgNode } from "./funcExpVariadicArgNode";

/** The function expression arguments data node */
export class FuncExpArgsNode extends DataNode implements Iterable<DataNode> {
  private _args: DataNode[] = [];
  private _argSubs: Function[] = [];

  private _funcType: FunctionType | undefined;
  private _expType: ExpType | undefined;
  private _initData: CallArg[] | undefined;

  constructor(type: ArrayType, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, undefined, parent, propProvider);
    this._initData = value as CallArg[] ?? []; // waiting parent
  }

  // #region ── Method ────────────────────────────────────────────────────────

  /** Function X ExpType => Arguments. */
  refreshFuncCall(type: ExpType, funcType: FunctionType | undefined) {
    if (type !== this._expType || funcType !== this._funcType)
    {
      this._funcType = funcType;
      this._expType = type;
      this.rebuildArgs();
    }
  }
  // #endregion

  // #region ── Value Access ───────────────────────────────────────────────

  override setValue(value: unknown) {
    this._initData = value as CallArg[] ?? [];
    this.rebuildArgs();
  }

  override getValue(): unknown {
    if (this._initData) return this._initData;
    const result: CallArg[] = [];
    for (const e of this._args)
    {
      if (e instanceof FuncExpArgNode )
        result.push(e.getValue() as CallArg);
      else if (e instanceof FuncExpVariadicArgNode)
        result.push(...(e.getValue() as CallArg[]));
    }
    // clear empty arguments
    for (let i = result.length - 1; i >= 0; i--)
    {
      if (isNull(result[i].value) && isNull(result[i].source))
        result.splice(i, 1);
    }
    return result;
  }

  override get submitValue(): unknown {
    return this.getValue();
  }

  // #endregion

  // #region ── Path Navigation ───────────────────────────────────────────────

  // special for argument choice
  override getAccessValue(path: string, node?: IValueAccess): IValueAccess | undefined {
    const dot = path.indexOf('.');
    const first = dot >= 0 ? path.substring(0, dot).toLowerCase() : path.toLowerCase();
    const rest = dot >= 0 ? path.substring(dot + 1).toLowerCase() : '';

    const arg = this._args.find(e => e.name?.toLowerCase() == first);
    if (!arg) return undefined;
    if (rest === NODE_TYPE) return arg.getAccessValue('sourceType');
    if (rest === NODE_SELF) return arg.getAccessValue('source');
    return arg.getAccessValue('value');
  }

  // #endregion

  // #region ── Iterable ───────────────────────────────────────────────────────

  /** Gets the arguments */
  [Symbol.iterator](): Iterator<DataNode> { return this._args[Symbol.iterator](); }

  /** Gets the length of the arguments */
  get length(): number { return this._args.length; }

  /** Gets the argument at the given index */
  get(index: number | string): DataNode | undefined {
    if (typeof index === 'number') return this._args[index];
    return this._args.find(e => e.name?.toLowerCase() == index.toLowerCase());
  }

  // #endregion

  // #region ── Utility ───────────────────────────────────────────────────────

  /** Add a new element to the array */
  private addRow(data: unknown, propertyProvider: IPropertyProvider, ctor: new (type: ValueType, data?: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) => DataNode): DataNode | undefined {
    const node = new ctor((this.type as ArrayType)!.element!, data, this, propertyProvider ?? this.propertyProvider);
    if (!node) return undefined;

    this._args.push(node);
    node.applyPropertyEffects();
    return node;
  }

  /** Rebuild the arguments */
  private rebuildArgs() {
    const data: CallArg[] = this._initData ?? this.submitValue as CallArg[];
    this._argSubs.forEach(s => s());
    this._args.forEach(e => e.dispose());
    this._argSubs = [];
    this._args = [];

    if (!this._funcType) return;
    delete this._initData;

    // refresh the arguments
    for (let i = 0; i < this._funcType.args.length; i++)
    {
      const arg = this._funcType.args.get(i)!;
      if (arg.variadic)
      {
        const adata = data.slice(i);
        if (!adata.length) adata.push({ type: arg.type });
        const node = this.addRow(adata, arg, FuncExpVariadicArgNode)!;
        this._argSubs.push(node.subscribe(() => this.refreshArgTypes()));
        break; // variadic arguments are the last
      }
      else
      {
        const adata = data[i] ?? { type: arg.type }
        const node = this.addRow(adata, arg, FuncExpArgNode)!;
        this._argSubs.push(node.subscribe(() => this.refreshArgTypes()));
      }
    }

    // attach the relations
    for (const e of this._args)
    {
      for (const r of this._funcType.args.getRelationsForArg(e.name!))
      {
        const target = this.getAccessValue(r.target, e);
        if (target)
          r.attach(this, target);
      }
    }
  }

  // refresh the argument types
  private async refreshArgTypes() {

  }

  // #endregion
}
