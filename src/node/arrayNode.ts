// =============================================================================
// ArrayNode — ordered collection of DataNodes
// Mirrors C# SchemaNode.Core/Node/ArrayNode.cs
// =============================================================================

import { DataNode } from './dataNode';
import type { ValueType } from '../runtime/type/valueType';
import type { ArrayType } from '../runtime/type/arrayType';
import { IPropertyProvider, IRelationInfo, IValueAccess } from '../runtime/interfaces';
import { isNull } from '../utility/toolset';
import { ARRAY_ELEMENT, ARRAY_PREVIOUS, NODE_SELF } from '../utility/constant';

export class ArrayNode extends DataNode implements Iterable<IValueAccess> {
  // #region ── ctor & dtor ───────────────────────────────────────────────────

  private _elements: IValueAccess[] = [];
  private _relations?: IRelationInfo[]; // the merged relations from types

  constructor(type: ValueType, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, undefined, parent, propProvider);

    const arrValue = Array.isArray(value) ? value : [];
    this.setValue(arrValue);
    this.confirm();

    this._elements.forEach(f => f.recordSubscription(f.subscribe(this.writeBackRawValue, true), this));
    this.attachRelations([{owner: this, relations: (type as ArrayType).getRelations().toArray()}]);
  }

  override dispose() {
    this._elements.forEach(f => f?.dispose());
    this._elements = [];
    delete this._relations;
    
    super.dispose();
  }

  // #endregion

  // #region Core Features ────────────────────────────────────────────────────

  get length(): number { return this._elements.length; }

  at(index: number): IValueAccess | undefined {
    return this._elements[index];
  }

  // #endregion

  // #region ── Value Access ──────────────────────────────────────────────────

  override setValue(value: unknown): void {
    const data: unknown[] = Array.isArray(value) ? value : [];
    super.setValue(value);

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
      this._elements.push(node);
      node.recordSubscription(node.subscribe(this.writeBackRawValue, true), this);
      if (this._relations?.length) node.attachRelations(this._relations);
    }
  }

  override getValue(): unknown { return this._elements.map(e => e.getValue()); }

  override get isEmpty(): boolean { return !this._elements.length; }

  override get changed(): boolean { return this._elements.some(e => e.changed); }

  override confirm(): void {
    this._elements.forEach(e => e?.confirm());
    super.confirm();
  }

  // #endregion

  // #region ── Path Navigation ───────────────────────────────────────────────

  override getAccessValue(path: string, node?: IValueAccess): IValueAccess | undefined {
    if (!path || path.trim() === NODE_SELF) return this;

    const dot = path.indexOf('.');
    const first = dot >= 0 ? path.substring(0, dot).toLowerCase() : path.toLowerCase();
    const rest = dot >= 0 ? path.substring(dot + 1) : '';

    let eleIndex = -1;
    let branch: IValueAccess | undefined = node;

    while (branch){
      eleIndex = this._elements.indexOf(branch);
      if (eleIndex !== -1) break;
      branch = branch?.parent;
    }
    if (eleIndex === -1) return undefined;

    let result: IValueAccess | undefined = undefined;
    if (first == ARRAY_PREVIOUS)
      result = new SliceArrayNode(this, 0, eleIndex); // for func call
    else 
    {
      result = this._elements[eleIndex];
      result = first == ARRAY_ELEMENT ? result : result?.getAccessValue(first, node);
    }
    return rest ? result?.getAccessValue(rest, node) : result;
  }

  // #endregion

  // #region ── Validation ────────────────────────────────────────────────────

  override get isValid(): boolean {
    return this._elements.every(e => e.isValid) && super.isValid;
  }

  // #endregion

  // #region ── Relation ──────────────────────────────────────────────────────

  override attachRelations(relationInfos: IRelationInfo[]): void {
    const elementRelations: IRelationInfo[] = [];

    relationInfos.forEach(info => {
      info.relations.forEach(r => {
        const paths = r.target.split('.').filter(p => p.trim() !== '');
        let curr: IValueAccess | undefined = info.owner;
        for (let i = 0; i < paths.length; i++) {
          if (curr === undefined) return;
          if (curr === this) {
            if (i === paths.length - 1)
              r.attach(info.owner, this);
            else
            {
              const exist = elementRelations.find(f => f.owner === info.owner);
              if (exist) {
                exist.relations.push(r);
              } else {
                elementRelations.push({owner: info.owner, relations: [r]});
              }
            }
            break;
          }
          curr = curr?.getAccessValue(paths[i], this);
        }
      });
    });

    this._elements.forEach(e => e.attachRelations(elementRelations));

    // merge relations, their owner should be different, just concat
    this._relations = this._relations ? [...this._relations, ...elementRelations.filter(e => !this._relations!.some(f => f.owner === e.owner))] : elementRelations;
  }

  // #endregion

  // #region ── Array Operations ──────────────────────────────────────────────

  addRow(index?: number, data?: unknown): DataNode | undefined {
    const elementType = (this.type as ArrayType).element;
    if (!elementType) return undefined;

    const node = elementType.create(data, this, this.propertyProvider);
    if (!node) return undefined;

    if (isNull(index)) index = this._elements.length;
    this._elements.splice(index!, 0, node);
  
    if (this._relations?.length) node.attachRelations(this._relations);
    node.recordSubscription(node.subscribe(this.writeBackRawValue, true), this);
    return node;
  }

  delRows(start: number, count = 1): void {
    if (start < 0 || start >= this._elements.length) return;

    const remove = this._elements.splice(start, count);
    remove.forEach(r => r.dispose());
    const rawValue = this.rawValue as unknown[];
    rawValue.splice(0, rawValue.length, ...this._elements.map(e => e.rawValue));

    this.onNext();
  }

  moveRow(from: number, to: number): void {
    if (from === to || from < 0 || to < 0 || from >= this._elements.length || to >= this._elements.length) return;

    const temp = this._elements[from];
    if (from < to) {
      for (let i = from; i < to; i++) {
        this._elements[i] = this._elements[i + 1];
      }
    } else {
      for (let i = from; i > to; i--) {
        this._elements[i] = this._elements[i - 1];
      }
    }
    this._elements[to] = temp;
    const rawValue = this.rawValue as unknown[];
    rawValue.splice(0, rawValue.length, ...this._elements.map(e => e.rawValue));

    this.onNext();
  }

  // #endregion

  // #region ── Iterator ──────────────────────────────────────────────────────

  [Symbol.iterator](): Iterator<IValueAccess> {
    return this._elements[Symbol.iterator]();
  }

  forEach(callback: (value: IValueAccess, index: number) => void): void {
    this._elements.forEach(callback);
  }

  map<T>(callback: (value: IValueAccess, index: number) => T): T[] {
    return this._elements.map(callback);
  }

  // #endregion

  // #region ── Utility ───────────────────────────────────────────────────────

  private writeBackRawValue(element: DataNode, value: unknown) {
    const arr = this._value as unknown[];
    if (!Array.isArray(arr)) return;

    const idx = this._elements.indexOf(element);
    if (idx >= 0) {
      arr[idx] = value;
      this.onNext();
    }
  }

  // #endregion
}

/** Array slice node */
export class SliceArrayNode extends DataNode {
  private _arrayNode: ArrayNode;
  private _start: number;
  private _end: number;

  constructor(arrayNode: ArrayNode, start?: number, end?: number) {
    super(arrayNode.type, undefined);
    this._arrayNode = arrayNode;
    this._start = start ?? 0;
    this._end = end ?? arrayNode.length;
  }

  override getValue(): unknown[] {
    return (this._arrayNode.value as unknown[]).slice(this._start, this._end);
  }

  override get rawValue(): unknown[] {
    return (this._arrayNode.rawValue as unknown[])?.slice(this._start, this._end) ?? [];
  }

  override subscribe(func: Function, immediate?: boolean): Function {
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