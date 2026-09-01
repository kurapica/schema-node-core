// =============================================================================
// ArrayNode — ordered collection of DataNodes
// Mirrors C# SchemaNode.Core/Node/ArrayNode.cs
// =============================================================================

import { Name } from "../../property/core/name";
import { Observable } from "../../utility/observable";
import { isNull, trimValue } from "../../utility/toolset";
import { DataNode } from "../value/node";
import { ArrayType } from "./runtime";

import type { IPropertyProvider, IRelationInfo, IValueAccess, ValueAccessFactory } from "../../interface";
import type { Observer } from "../../utility/observable";

import { ARRAY_ELEMENT, ARRAY_PREVIOUS, NODE_SELF } from "../../utility/constant";

/** The array node contains the array data values */
export class ArrayNodeTemplate<T extends DataNode> extends DataNode implements Iterable<T> {
  // #region ── ctor & dtor ───────────────────────────────────────────────────

  protected _elements: T[] = [];
  protected _relations?: IRelationInfo[]; // the merged relations from types
  protected _arrayDataOb?: Observable<[IValueAccess, unknown, number]>;

  constructor(type: ArrayType, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, undefined, parent, propProvider);

    const arrValue = Array.isArray(value) ? value : [];
    this.setValue(arrValue);
    this.confirm();

    this._elements.forEach(f => 
    {
      f.applyPropertyEffects();
      f.recordSubscription(f.subscribe(this.writeBackRawValue, true), this);
    });

    // attach relations from self
    this.attachRelations([{owner: this, relations: Array.from(type.getRelations())}]);
  }

  override dispose() {
    this._arrayDataOb?.dispose();
    delete this._arrayDataOb;

    this._elements.forEach(f => f?.dispose());
    this._elements = [];
    delete this._relations;
    
    super.dispose();
  }

  override moveSubscription(newNode: DataNode): void {
    super.moveSubscription(newNode);
    if (newNode instanceof ArrayNodeTemplate) {
      newNode._arrayDataOb = this._arrayDataOb;
      this._arrayDataOb = undefined;
    }
  }

  // #endregion

  // #region Core Features ────────────────────────────────────────────────────

  get length(): number { return this._elements.length; }

  at(index: number): T | undefined {
    return this._elements[index];
  }

  private *_getElements() { yield* this._elements; }

  /** Get the elements of the array. */
  get elements(): Iterable<DataNode> { return this._getElements(); }

  /** Get the maximum size constraint of the array. */
  get maxSize(): number | undefined { return this.getPropertyValue<number>("MaxSize"); }

  /** Get the minimum size constraint of the array. */
  get minSize(): number { return this.getPropertyValue<number>("MinSize") ?? 0; }

  /** Get the addable status of the array. */
  get addAble(): boolean { return this.maxSize === undefined || this.length < this.maxSize; }

  /** Get the deletable status of the array. */
  get delAble(): boolean { return this.minSize < this.length; }

  // #endregion

  // #region ── Value Access ──────────────────────────────────────────────────

  override setValue(value: unknown): void {
    const data: unknown[] = Array.isArray(value) ? value : [];
    super.setValue(data);

    const elementType = (this.type as ArrayType).element;
    if (!elementType) {
      this._elements = [];
      return;
    }

    for (let i = 0; i < Math.min(this._elements.length, data.length); i++)
      this._elements[i].setValue(data[i]);

    for (let i = this._elements.length - 1; i >= data.length; i--)
      this._elements[i]?.dispose();

    this._elements.length = Math.min(this._elements.length, data.length);

    for (let i = this._elements.length; i < data.length; i++) {
      const node = elementType.create(data[i], this, this.propertyProvider);
      this._elements.push(node as T);
      node.recordSubscription(node.subscribe(this.writeBackRawValue, true), this); // so subscription will be disposed when node is disposed
      if (this._relations?.length) node.attachRelations(this._relations); // attach all relations from self and parents
    }
    this.refreshElementNames(); // override name
  }

  override getValue(): unknown { return trimValue(this._elements.map(e => e.getValue())); }

  override get isEmpty(): boolean { return !this._elements.length; }

  override get changed(): boolean { return this._elements.some(e => e.changed); }

  override confirm(): void {
    this._elements.forEach(e => e?.confirm());
    super.confirm();
  }

  // #endregion

  // #region ── Property ──────────────────────────────────────────────────────

  override setPropertyValues(props: Record<string, unknown>, source?: IValueAccess, ...kinds: string[]): void {
    const eleKind = (this.type as ArrayType).element?.kind;
    if (eleKind && !kinds.includes(eleKind)) kinds.push(eleKind);
    super.setPropertyValues(props, source, ...kinds);
  }

  // #endregion

  // #region ── Subscription ──────────────────────────────────────────────────

  /** Subscribe the array item change and return the function for un-subsribe, normally for element subscribe previous nodes */
  subscribeItem(func: Observer<[IValueAccess, unknown, number]>, immediate?: boolean): Function {
    this._arrayDataOb ??= new Observable();
    const sub = this._arrayDataOb.subscribe(func);
    if (immediate) func(this, this.rawValue, this.length);
    return sub;
  }

  /** Publish the array item change */
  onNextItem(index: number) {
    this._arrayDataOb?.onNext(this, this.rawValue, index);
    this.onNext();
  }

  //#endregion
  
  // #region ── Path Navigation ───────────────────────────────────────────────

  override getAccessValue(path: string, node?: IValueAccess): IValueAccess | undefined {
    const access = super.getAccessValue(path, node);
    if (access) return access;

    const dot = path.indexOf('.');
    const first = dot >= 0 ? path.substring(0, dot).toLowerCase() : path.toLowerCase();
    const rest = dot >= 0 ? path.substring(dot + 1) : '';

    let eleIndex = -1;
    let branch: IValueAccess | undefined = node;

    while (branch){
      eleIndex = this._elements.indexOf(branch as T);
      if (eleIndex !== -1) break;
      branch = branch?.parent;
    }
    if (eleIndex === -1) return undefined;

    let result: IValueAccess | undefined = undefined;
    if (first == ARRAY_PREVIOUS) {
      result = new SliceArrayNode(this, 0, eleIndex, this._elements[eleIndex]); // for previous
    } else if (first == ARRAY_ELEMENT) {
      result = this._elements[eleIndex];
      return rest ? result?.getAccessValue(rest, node) : result;
    }
    return undefined;
  }

  // #endregion

  // #region ── Validation ────────────────────────────────────────────────────

  override *getErrorNodes(): Generator<IValueAccess> {
    for (const e of this._elements)
      if (!e.isValid) yield* e.getErrorNodes();
    yield* super.getErrorNodes();
  }

  override get isValid(): boolean {
    return this._elements.every(e => e.isValid) && super.isValid;
  }

  override clearConstraints(): void {
    this._elements.forEach(e => e.clearConstraints());
    super.clearConstraints();
  }

  // #endregion

  // #region ── Relation ──────────────────────────────────────────────────────

  override attachRelations(relationInfos: IRelationInfo[]): void {
    const elementRelations: IRelationInfo[] = [];

    relationInfos.forEach(info => {
      info.relations.forEach(r => {
        const paths = r.target.split('.').filter(p => p.trim() !== '');
        let curr: IValueAccess | undefined = info.owner;
        let index = 0;

        // indicate this
        while (curr && curr !== this && index < paths.length)
          curr = curr?.getAccessValue(paths[index++], this);
        if (!curr) return;

        // set relation to this
        if (index === paths.length)
          return r.attach(info.owner, this);

        const exist = elementRelations.find(f => f.owner === info.owner);
        if (exist) {
          exist.relations.push(r);
        } else {
          elementRelations.push({owner: info.owner, relations: [r]});
        }
      });
    });

    this._elements.forEach(e => e.attachRelations(elementRelations));

    // merge relations, their owner should be different, just concat
    this._relations = this._relations ? [...this._relations, ...elementRelations.filter(e => !this._relations!.some(f => f.owner === e.owner))] : elementRelations;
  }

  // #endregion

  // #region ── Array Operations ──────────────────────────────────────────────

  /** Add a new element to the array */
  addRow(index?: number, data?: unknown, propertyProvider?: IPropertyProvider, ctor?: ValueAccessFactory): T | undefined {
    const elementType = (this.type as ArrayType).element;
    if (!elementType || !this.addAble) return undefined;

    const node = ctor 
      ? new ctor(elementType, data, this, propertyProvider ?? this.propertyProvider) as T 
      : elementType.create(data, this, propertyProvider ?? this.propertyProvider) as T;
    if (!node) return undefined;

    if (isNull(index)) index = this._elements.length;
    this._elements.splice(index!, 0, node);
  
    node.applyPropertyEffects();
    if (this._relations?.length) node.attachRelations(this._relations);
    node.recordSubscription(node.subscribe(this.writeBackRawValue, true), this);
    this.refreshElementNames();
    if (index! + 1 < this._elements.length) {
      for (let i = index! + 1; i < this._elements.length; i++)
      {
        const item = this._elements[i];
        this.writeBackRawValue(item, item.rawValue);
      }
    }
    else
      this.onNextItem(index!);
    return node;
  }

  /** Delete elements from the array */
  delRows(start: number, count = 1): void {
    if (start < 0 || start >= this._elements.length || !this.delAble) return;

    const remove = this._elements.splice(start, count);
    remove.forEach(r => r.dispose());
    const rawValue = this.rawValue as unknown[];
    rawValue.splice(0, rawValue.length, ...this._elements.map(e => e.rawValue));
    this.refreshElementNames();
    this.onNextItem(start);
  }

  /** Move elements in the array */
  moveRow(from: number, to: number): void {
    if (from === to || from < 0 || to < 0 || from >= this._elements.length || to >= this._elements.length) return;
    const temp = this._elements[from].value;
    if (from < to) {
      for (let i = from; i < to; i++) {
        this._elements[i].value = this._elements[i + 1].value;
      }
    } else {
      for (let i = from; i > to; i--) {
        this._elements[i].value = this._elements[i - 1].value;
      }
    }
    this._elements[to].value = temp;
  }

  // #endregion

  // #region ── Iterator ──────────────────────────────────────────────────────

  [Symbol.iterator](): Iterator<T> {
    return this._elements[Symbol.iterator]();
  }

  forEach(callback: (value: T, index: number) => void): void {
    this._elements.forEach(callback);
  }

  map<V>(callback: (value: T, index: number) => V): V[] {
    return this._elements.map(callback);
  }

  /** Get the index of the element node */
  indexOf(node: T): number { return this._elements.indexOf(node); }

  // #endregion

  // #region ── Utility ───────────────────────────────────────────────────────

  private writeBackRawValue = (element: IValueAccess, value: unknown) => {
    const arr = this.rawValue as unknown[];
    if (!Array.isArray(arr)) return;

    const idx = this._elements.indexOf(element as T);
    if (idx >= 0) {
      arr[idx] = value;
      this.onNextItem(idx);
    }
  }

  private refreshElementNames = () => {
    this._elements.forEach((e, i) => e.setPropertyValue(Name, `[${i}]`));
  }

  // #endregion
}

/** Array slice node */
export class SliceArrayNode extends DataNode {
  private _arrayNode: ArrayNode;
  private _start: number;
  private _end: number;
  private _sourceNode?: DataNode;

  constructor(arrayNode: ArrayNode, start?: number, end?: number, sourceNode?: DataNode) {
    super(arrayNode.type, undefined);
    this._arrayNode = arrayNode;
    this._start = start ?? 0;
    this._end = end ?? arrayNode.length;
    this._sourceNode = sourceNode;
  }

  override getValue(): unknown[] {
    return (this._arrayNode.value as unknown[]).slice(this._start, this._end);
  }

  override get rawValue(): unknown[] {
    return (this._arrayNode.rawValue as unknown[])?.slice(this._start, this._end) ?? [];
  }

  override subscribe(func: Observer<[IValueAccess, unknown]>, immediate?: boolean): Function {
    const arrayNode = this._arrayNode;
    const sourceNode = this._sourceNode;
    if (sourceNode)
    {
      return arrayNode.subscribeItem((node, item, index) => {
        // only emit items before the source node
        const sidx = arrayNode.indexOf(sourceNode!);
        if (index < sidx) func(node, Array.isArray(item) ? item.slice(0, index + 1) : item);
      });
    }
    else
      return this._arrayNode.subscribe(func, immediate);
  }

  override recordSubscription(subscription: Function, source: unknown): void {
    this._arrayNode.recordSubscription(subscription, source);
  }

  override clearSubscription(source: unknown): void {
    this._arrayNode.clearSubscription(source);
  }

  override attachRelations(relationInfos: IRelationInfo[]): void {}
}

/** The array node contains the array data values */
export class ArrayNode extends ArrayNodeTemplate<DataNode> {}
