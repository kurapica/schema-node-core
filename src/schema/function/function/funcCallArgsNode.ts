import { ArrayType } from "../../array/runtime";
import { DataNode } from "../../value/node";
import { FunctionType } from "../runtime";

import type { IPropertyProvider, IValueAccess, ValueAccessFactory } from "../../../interface";
import { buildFuncCall, type CallArg } from "../type";

import { NODE_SELF, NODE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_TYPE } from "../../../utility/constant";
import { ApplyMode } from "../../../enum/applyMode/type";
import { StructNode, StructType } from "../../struct";
import { AccessEntryConsumer, Display, Name, ReadOnly } from "../../../property";
import { Observable, type Observer } from "../../../utility/observable";
import { SystemReflectType } from "../../../function";
import { FuncCallVarNode } from "./funcCallVarNode";
import { _LS } from "../../../utility";
import type { LocaleString } from "../../../struct/localeString/type";

/** The function expression arguments data node */
export class FuncCallArgsNode extends DataNode implements Iterable<StructNode> {
  private _args: StructNode[] = [];
  private _varArg: FuncCallVarNode | undefined;

  private _funcType: FunctionType | undefined;
  private _mode: ApplyMode | undefined;
  private _initData: CallArg[] | undefined;
  private _argType: StructType
  private _argCountOb?: Observable<[IValueAccess, number]>;
  private _preColIdx: number = -1;

  constructor(type: ArrayType, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, undefined, parent, propProvider);
    this._argType = type.element as StructType;
    this._initData = value as CallArg[] ?? []; // waiting parent
  }

  override dispose() {
    this._argCountOb?.dispose();
    delete this._argCountOb;

    this._args.forEach(e => e.dispose());
    this._args = [];

    this._varArg?.dispose();
    this._varArg = undefined;

    super.dispose();
  }

  // #region ── Method ────────────────────────────────────────────────────────

  /** Function X ApplyMode => Arguments. */
  refreshFuncCall(mode: ApplyMode, funcType: FunctionType | undefined) {
    if (mode == this._mode && funcType == this._funcType) return;
    this._funcType = funcType;
    this._mode = mode;
    this.rebuildArgs();
  }

  // #endregion

  // #region ── Value Access ───────────────────────────────────────────────

  override get isEmpty() {
    return this._args.length == 0 && (this._varArg?.isEmpty ?? true);
  }

  override setValue(value: unknown) {
    this._initData = value as CallArg[] ?? [];
    this.rebuildArgs();
  }

  override getValue(): unknown {
    if (this._initData) return this._initData;

    const result: CallArg[] = this._args.map(e => e.getValue() as CallArg);
    if (this._varArg) result.push(...this._varArg.getValue() as CallArg[]);

    return result;
  }

  override get changed() { return this._args.some(e => e.changed) || this._varArg?.changed || false; }

  override get isValid() { return this._args.every(e => e.isValid) && (this._varArg?.isValid ?? true); }

  override get error() { return this._args.find(e => e.error)?.error ?? this._varArg?.error; }

  override *getErrorNodes() {
    for(let e of this._args) 
      yield* e.getErrorNodes();
    if (this._varArg)
      yield* this._varArg.getErrorNodes();
  }

  override confirm(): void {
    this._args.forEach(e => e.confirm());
    this._varArg?.confirm();
  }

  // #endregion

  // #region ── Args Changed ───────────────────────────────────────────────

  /** Subscribe the array item change and return the function for un-subsribe, normally for element subscribe previous nodes */
  subscribeArgs(func: Observer<[IValueAccess, number]>, immediate?: boolean): Function {
    this._argCountOb ??= new Observable();
    const sub = this._argCountOb.subscribe(func);
    if (immediate) func(this, this.length);
    return sub;
  }

  /** Publish the array item change */
  onNextArgs() {
    this._argCountOb?.onNext(this, this.length);
  }

  // #endregion

  // #region ── Path Navigation ───────────────────────────────────────────────

  // special for argument choice
  override getAccessValue(path: string, node?: IValueAccess): IValueAccess | undefined {
    const dot = path.indexOf('.');
    const first = dot >= 0 ? path.substring(0, dot).toLowerCase() : path.toLowerCase();
    const rest = dot >= 0 ? path.substring(dot + 1).toLowerCase() : '';

    const arg = this._args.find(e => e.name?.toLowerCase() == first) ?? (this._varArg?.name?.toLowerCase() == first ? this._varArg : undefined);
    if (!arg) return undefined;
    if (rest === NODE_TYPE) return arg.getAccessValue('sourceType');
    if (rest === NODE_SELF) return arg.getAccessValue('source');
    return arg.getAccessValue('value');
  }

  // #endregion

  // #region ── Iterable ───────────────────────────────────────────────────────

  private *_getArgs(): Generator<StructNode> {
    yield* this._args;
    if (this._varArg)
      yield* this._varArg;
  }

  /** Gets the arguments & variadic argument */
  [Symbol.iterator](): Iterator<StructNode> { return this._getArgs(); }

  /** Gets the length of the arguments */
  get length(): number { return this._args.length + (this._varArg?.length ?? 0); }

  /** Gets the argument at the given index */
  at(index: number | string): DataNode | undefined {
    if (typeof index === 'number') return index >= this._args.length ? this._varArg?.at(index - this._args.length) : this._args[index];
    return this._args.find(e => e.name?.toLowerCase() == index.toLowerCase()) 
      ?? (this._varArg?.name?.toLowerCase() == index.toLowerCase() ? this._varArg : undefined);
  }

  /** Gets the variadic argument */
  get variadicArg(): FuncCallVarNode | undefined { return this._varArg; }

  // #endregion

  // #region ── Utility ───────────────────────────────────────────────────────

  /** Add a new element to the array */
  private addRow(data: unknown, propertyProvider: IPropertyProvider, factory?: ValueAccessFactory): StructNode | undefined {
    const node = factory 
      ? new factory(this._argType, data, this, propertyProvider ?? this.propertyProvider) as StructNode 
      : this._argType.create(data, this, propertyProvider ?? this.propertyProvider) as StructNode;
    if (!node) return undefined;

    this._args.push(node);
    node.applyPropertyEffects();
    return node;
  }

  /** Rebuild the arguments */
  private rebuildArgs() {
    const data: CallArg[] = this._initData ?? this.submitValue as CallArg[];
    let readonly = false;
    let node: DataNode = this;
    while (node && !node.readonly && node.parent instanceof DataNode)
      node = node.parent;
    readonly = node?.readonly ?? false;

    this._args.forEach(e => e.dispose());
    this._args = [];

    this._varArg?.dispose();
    this._varArg = undefined;

    this._preColIdx = -1;

    if (!this._funcType || this._funcType.isGeneric) return;
    delete this._initData;

    super.setValue(data);

    // refresh the arguments
    for (let i = 0; i < this._funcType.args.length; i++)
    {
      const arg = this._funcType.args.at(i)!;
      if (arg.variadic)
      {
        const adata = data.slice(i);
        const argName = arg.getPropertyValue<LocaleString>(Display) ?? _LS(arg.name);
        if (!adata.length && !readonly) adata.push({ name: argName, type: arg.type });
        adata.forEach(a => { a.type = arg.type; a.name = argName; });
        const node = new FuncCallVarNode(this._argType, adata, this, arg);
        if (readonly)
          node.setPropertyValue(ReadOnly, true);
        else {
          node.recordSubscription(node.subscribeArgs(() => this.onNextArgs()));
          node.recordSubscription(node.subscribe(this.writeBackRawValue));
        }
        this._varArg = node;
        break; // variadic arguments are the last
      }
      else
      {
        const argName = arg.getPropertyValue<LocaleString>(Display) ?? _LS(arg.name);
        const adata = typeof data[i] === 'object' ? { ...data[i], name: argName, type: arg.type } : { name: argName, type: arg.type };
        const node = this.addRow(adata, arg)!;

        if (readonly)
          node.setPropertyValue(ReadOnly, true);
        else { 
          node.recordSubscription(node.subscribe(this.writeBackRawValue));
          if (this._mode !== ApplyMode.Call) {
            node.getAccessValue('source')!.setPropertyValue(AccessEntryConsumer, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.isassignableto`, '@source', true, arg.type ?? '@type'), node);
            node.recordSubscription(node.subscribe(() => this.refreshArgTypes()));
          }
        }
      }
    }

    // attach the relations
    if (!readonly) {
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

    this.onNextArgs();
  }

  /** Refresh the argument types */
  private async refreshArgTypes() {
    let colIdx = -1;
    for (let i = 0; i < this._args.length; i++) {
      const e = this._args[i];
      const type = (e.rawValue! as any)?.type;
      const source = (e.rawValue! as any)?.sourceType;
      if (source && type && source !== type)
      {
        if (await SystemReflectType.isassignableto(source, false, type))
          continue;
        if (await SystemReflectType.isassignableto(source, true, type))
        {
          colIdx = i;
          break;
        }
      }
    }
    if (colIdx != this._preColIdx)
    {
      for (let i = 0; i < this._args.length; i++)
      {
        const arg = this._funcType!.args.at(i)!;
        const node = this._args[i];
        node.getAccessValue('source')!.setPropertyValue(AccessEntryConsumer, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.isassignableto`, '@source', colIdx < 0 || colIdx == i, arg.type ?? '@type'), node);
      }
      this._preColIdx = colIdx;
    }
  }

  /** Write back the raw value to the array of arguments */
  private writeBackRawValue = (element: IValueAccess, value: unknown) => {
    const arr = this.rawValue as unknown[];
    if (!Array.isArray(arr)) return;

    const idx = this._args.indexOf(element as StructNode);
    if (idx >= 0) {
      arr[idx] = value;
      this.onNext();
    }
    else if (this._varArg == element && Array.isArray(value))
    {
      arr.splice(this._args.length, Math.max(0, arr.length - this._args.length), ...value);
      this.onNext();
    }
  }

  // #endregion
}
