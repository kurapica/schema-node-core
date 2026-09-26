import { isEmpty, isNull, splitString } from "../../../utility/toolset";
import { DataNode } from "../../value/node";

import type { IPropertyProvider, IValueAccess, IValueTypeAccess } from "../../../interface";
import { buildFuncCall, type CallArg } from "../type";
import type { StructNode } from "../../struct/node";
import { Observable, type Observer } from "../../../utility/observable";
import type { StructType } from "../../struct/runtime";
import { ReadOnly } from "../../../property/common/readOnly";
import { MinSize } from "../../array/property/minSize";
import { MaxSize } from "../../array/property/maxSize";
import { ParamsList } from "../property/paramsList";
import type { Entry } from "../../../struct/entry/type";
import { Display } from "../../../property/common/display";
import { getPropertyValue } from "../../../property/propertyOwner";
import { AccessEntryConsumer } from "../../string/property/accessEntryConsumer";
import { ARRAY_ELEMENT, NODE_SELF, NS_SYSTEM_SCHEMA_REFLECT_TYPE } from "../../../utility/constant";

/** The function expression variable data node */
export class FuncCallVarNode extends DataNode implements Iterable<StructNode> {
  private _args: StructNode[] = [];
  private _argType: StructType
  private _argCountOb?: Observable<[IValueAccess, number]>;
  private _colSelectable: boolean = false;

  constructor(type: IValueTypeAccess, value: unknown, parent?: IValueAccess, ...propProviders: IPropertyProvider[]) {
    super(type, undefined, parent, ...propProviders);
    this._argType = type as StructType;
    super.setValue([]);
    if (Array.isArray(value))
      for(let e of value) this.addRow(e);

    // subscribe the params list property
    this.subscribeProperty(ParamsList, this.refreshParamsList);
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

  override get submitValue(): unknown {
    const result: CallArg[] = this._args.map(e => e.submitValue as CallArg);

    // clear empty arguments
    for (let i = result.length - 1; i >= 0; i--)
      if (isNull(result[i].value) && isNull(result[i].source))
        result.splice(i, 1);
    return result;
  }

  async setCollectionSelectable(selectable: boolean) {
    this._colSelectable = selectable;
    const node = this._args[0];
    if (!node) return;
    node.getAccessValue('source')?.setPropertyValue(AccessEntryConsumer, selectable ? buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.isassignableto`, NODE_SELF, true, `@${ARRAY_ELEMENT}.type`) : undefined, node.parent);
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

  // special for argument choice
  override getAccessValue(path: string, node?: IValueAccess): IValueAccess | undefined {
    const g = super.getAccessValue(path, node);
    if (g) return g;

    if (!path?.length) return undefined;
    
    const paths = splitString(path, '.', 2);
    if (paths[0] == ARRAY_ELEMENT) {
      let item = node;
      while (item && item.parent != this)
        item = item.parent;
      return paths.length == 1 ? item : item?.getAccessValue(paths[1]);
    }

    return undefined;
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
    if (this._args.length == 1 && this._colSelectable)
      this.setCollectionSelectable(true);
    return node;
  }

  private refreshParamsList = () => {
    const paramList = this.getPropertyValue<Entry<string>[]>(ParamsList);
    if (paramList?.length) {
      while (this._args.length > paramList.length)
        this._args.pop()?.dispose();
      for (let i = 0; i < paramList.length; i++)
      {
        const e = paramList[i];
        const r = this._args[i];
        if (r) {
          r.getAccessValue('name')?.setValue(getPropertyValue(e, Display));
          r.getAccessValue('type')?.setValue(e.value);
        }
        else
        {
          this.addRow({ name: e.value, type: e.value });
        }
      }
      this.onNextArgs();
    }
  }

  // refresh the argument types
  private refreshArgTypes = async (element: IValueAccess, value: unknown) => {
    if (this.getProperty(ParamsList)?.hasValue) return;

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
