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

export class ArrayNode extends DataNode implements Iterable<DataNode> {
  // #region ── ctor & dtor ───────────────────────────────────────────────────

  private _elements: DataNode[] = [];

  constructor(type: ValueType, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, undefined, parent, propProvider);

    const arrValue = Array.isArray(value) ? value : [];
    this.setValue(arrValue);
    this.confirm();

    this._elements.forEach(f => {
      if (f.displayOnly) return;
      this.recordSubscription(f.subscribe(this.writeBackRawValue, true));
    });

    this.attachRelations([{owner: this, relations: (type as ArrayType).getRelations().toArray()}]);
  }

  override dispose() {
    this._elements.forEach(f => f.dispose());
    this._elements = [];
    super.dispose();
  }

  // #endregion

  // #region Core Features ────────────────────────────────────────────────────

  get elements(): DataNode[] { return this._elements; }

  *elementsGenerator(): Generator<DataNode> {
    for (const e of this._elements) {
      yield e;
    }
  }

  get count(): number { return this._elements.length; }

  at(index: number): DataNode | undefined {
    return this._elements[index];
  }

  tryGetValue<T>(): T | undefined {
    return this._elements.map((e) => e.getValue()) as unknown as T;
  }

  // #endregion

  // #region ── Value Access ──────────────────────────────────────────────────

  override setValue(value: unknown): void {
    const data: unknown[] = Array.isArray(value) ? value : [];

    const elementType = (this.type as ArrayType).element;
    if (!elementType) {
      this._elements = [];
      super.setValue(data);
      return;
    }

    for (let i = 0; i < Math.min(this._elements.length, data.length); i++) {
      this._elements[i].setValue(data[i]);
    }

    for (let i = this._elements.length - 1; i >= data.length; i--) {
      this._elements[i].dispose();
    }
    this._elements.length = data.length;

    for (let i = this._elements.length; i < data.length; i++) {
      const node = elementType.create(data[i], this);
      this._elements.push(node);
      if (!node.displayOnly) {
        this.recordSubscription(node.subscribe(this.writeBackRawValue, true));
      }
    }

    super.setValue(value);
  }

  override getValue(): unknown {
    const result: unknown[] = [];
    this._elements.forEach(e => {
      if (e.isEmpty || e.displayOnly) return;
      if (!e.isValid && !e.visible) return;
      result.push(e.getValue());
    });
    return result;
  }

  override get isEmpty(): boolean {
    return !this._elements.some(e => !e.displayOnly && !e.isEmpty);
  }

  override get changed(): boolean {
    return this._elements.some(e => !e.displayOnly && e.changed);
  }

  override confirm(): void {
    this._elements.forEach(e => e.confirm());
    super.confirm();
  }

  // #endregion

  // #region ── Path Navigation ───────────────────────────────────────────────

  override getAccessValue(path: string, node?: IValueAccess): IValueAccess | undefined {
    const dot = path.indexOf('.');
    const first = dot >= 0 ? path.substring(0, dot).toLowerCase() : path.toLowerCase();
    const rest = dot >= 0 ? path.substring(dot + 1) : '';

    if (!first || first === NODE_SELF) return this;
    if (first === ARRAY_ELEMENT) {
      const elem = this._elements[this._elements.length - 1];
      return rest && elem ? elem.getAccessValue(rest, node) : elem;
    }
    if (first === ARRAY_PREVIOUS) {
      const prev = this._elements[this._elements.length - 2];
      return rest && prev ? prev.getAccessValue(rest, node) : prev;
    }

    const idx = parseInt(first, 10);
    if (!isNaN(idx)) {
      const elem = this._elements[idx];
      return rest && elem ? elem.getAccessValue(rest, node) : elem;
    }

    return undefined;
  }

  // #endregion

  // #region ── Validation ────────────────────────────────────────────────────

  override get isValid(): boolean {
    return !this._elements.some(e => !e.displayOnly && !e.isValid) && super.isValid;
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
            const target = paths[i].toLowerCase();
            if (target === ARRAY_ELEMENT || target === ARRAY_PREVIOUS || !isNaN(parseInt(target, 10))) {
              const exist = elementRelations.find(f => f.owner === info.owner);
              if (exist) {
                exist.relations.push(r);
              } else {
                elementRelations.push({owner: info.owner, relations: [r]});
              }
            } else if (i === paths.length - 1) {
              r.attach(info.owner, this);
            }
            break;
          }
          curr = curr?.getAccessValue(paths[i], this);
        }
      });
    });

    this._elements.forEach(e => e.attachRelations(elementRelations));
  }

  // #endregion

  // #region ── Array Operations ──────────────────────────────────────────────

  addRow(index?: number, data?: unknown): DataNode | undefined {
    const elementType = (this.type as ArrayType).element;
    if (!elementType) return undefined;

    const node = elementType.create(data, this);
    if (!node) return undefined;

    if (isNull(index)) index = this._elements.length;
    this._elements.splice(index!, 0, node);

    if (!node.displayOnly) {
      this.recordSubscription(node.subscribe(this.writeBackRawValue, true));
    }

    this.onNext();
    return node;
  }

  delRows(start: number, count = 1): void {
    if (start < 0 || start >= this._elements.length) return;

    const remove = this._elements.splice(start, count);
    remove.forEach(r => r.dispose());

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

    this.onNext();
  }

  // #endregion

  // #region ── Iterator ──────────────────────────────────────────────────────

  [Symbol.iterator](): Iterator<DataNode> {
    return this._elements[Symbol.iterator]();
  }

  forEach(callback: (node: DataNode, index: number) => void): void {
    this._elements.forEach(callback);
  }

  // #endregion

  // #region ── Utility ───────────────────────────────────────────────────────

  private writeBackRawValue(element: DataNode, value: unknown) {
    const arr = this._value as unknown[];
    if (!Array.isArray(arr)) return;

    const idx = this._elements.indexOf(element);
    if (idx >= 0) {
      arr[idx] = value;
    }
    this.onNext();
  }

  // #endregion
}