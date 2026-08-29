import { isEmpty, isNull } from "../../../utility/toolset";
import { DataNode } from "../../value/node";

import type { IPropertyProvider, IValueAccess, IValueTypeAccess } from "../../../interface";
import { type CallArg } from "../type";
import type { StructNode } from "../../struct/node";
import { Observable, type Observer } from "../../../utility/observable";
import type { StructType } from "../../struct/runtime";
import { ReadOnly } from "../../../property/common/readOnly";
import { MaxSize, MinSize } from "../../../property/constraint/size";

/** The function expression variable data node */
export class FuncCallVarNode extends DataNode implements Iterable<StructNode> {
  private _args: StructNode[] = [];
  private _argType: StructType
  private _argCountOb?: Observable<[IValueAccess, number]>;

  constructor(type: IValueTypeAccess, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, undefined, parent, propProvider);
    this._argType = type as StructType;
    super.setValue([]);
    if (Array.isArray(value))
      for(let e of value) this.addRow(e);
   }

  override dispose() {
    this._argCountOb?.dispose();
    delete this._argCountOb;

    this._args.forEach(e => e.dispose());
    this._args = [];
    super.dispose();
  }

  // #region ── Value Access ───────────────────────────────────────────────

  override get isEmpty() {
    return this._args.length == 0 || this._args.every(e => e.getAccessValue('value')!.isEmpty && e.getAccessValue('source')!.isEmpty);
  }

  override get changed() { return this._args.some(e => e.changed); }

  override get isValid() { return this._args.every(e => e.isValid); }

  override get error() { return this._args.find(e => e.error)?.error || undefined; }

  override *getErrorNodes() {
    for(let e of this._args) 
      yield* e.getErrorNodes();
  }

  override confirm(): void {
    this._args.forEach(e => e.confirm());
  }

  override getValue(): unknown {
    const result: CallArg[] = this._args.map(e => e.getValue() as CallArg);

    // clear empty arguments
    for (let i = result.length - 1; i >= 0; i--)
      if (isNull(result[i].value) && isNull(result[i].source))
        result.splice(i, 1);
    return result;
  }

  // #endregion

  // #region ── Args Changed ───────────────────────────────────────────────

  /** Subscribe the array item change and return the function for un-subsribe, normally for element subscribe previous nodes */
  subscribeArgs(func: Observer<[IValueAccess, number]>, immediate?: boolean): Function {
    this._argCountOb ??= new Observable();
    const sub = this._argCountOb.subscribe(func);
    if (immediate) func(this, this._args.length);
    return sub;
  }

  /** Publish the array item change */
  onNextArgs() {
    this._argCountOb?.onNext(this, this._args.length);
  }

  // #endregion

  // #region ── Iterable ───────────────────────────────────────────────────────

  /** Gets the arguments */
  [Symbol.iterator](): Iterator<StructNode> { return this._args[Symbol.iterator](); }

  /** Gets the length of the arguments */
  get length(): number { return this._args.length; }

  /** Gets the argument at the given index */
  at(index: number | string): StructNode | undefined {
    if (typeof index === 'number') return this._args[index];
    return this._args.find(e => e.name?.toLowerCase() == index.toLowerCase());
  }

  // #endregion

  // #region ── Utility ───────────────────────────────────────────────────────

  /** Add a new element to the array */
  private addRow(data: unknown): StructNode | undefined {
    const node = this._argType.create(data, this) as StructNode;
    if (!node) return undefined;

    this._args.push(node);
    node.applyPropertyEffects();
    node.recordSubscription(node.subscribe(this.refreshArgTypes));
    return node;
  }

  // refresh the argument types
  private refreshArgTypes = async (element: IValueAccess, value: unknown) => {
    const arr = this.rawValue as unknown[];
    if (!Array.isArray(arr)) return;

    const idx = this._args.indexOf(element as StructNode);
    if (idx >= 0) {
      arr[idx] = value;
      this.onNext();
    }
    if (this.getPropertyValue<boolean>(ReadOnly)) return;

    // expand or reduce the arguments
    const argCnt = this._args.length;
    let last: any = this._args[this._args.length - 1]?.rawValue;
    if (!isEmpty(last?.source) || !isEmpty(last?.value))
    {
      const max = this.getPropertyValue<number>(MaxSize);
      if (max && this._args.length >= max)
        return;
      this.addRow({ name: last.name, type: last.type });
    }
    else
    {
      const min = Math.max(1, this.getPropertyValue<number>(MinSize) ?? 0);
      while (this._args.length > min)
      {
        last = this._args[this._args.length - 2].rawValue;
        if (isEmpty(last?.source) && isEmpty(last?.value))
          this._args.pop()?.dispose();
        else
          break;
      }
    }
    if (this._args.length != argCnt)
      this.onNextArgs();
  }

  // #endregion
}
