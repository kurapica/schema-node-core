// =============================================================================
// DataNode — abstract base for all data-holding nodes
// Mirrors C# SchemaNode.Core/Node/DataNode.cs
// =============================================================================

import type { ValueType } from '../runtime/type/valueType';
import type { IProperty } from '../property/property';
import { IValueAccess } from '../runtime/interfaces';
import { isEmpty, isEqual } from '../utility/toolset';
import { Observable } from '../utility/observable';

/**
 * A DataNode holds a value (or children) governed by a runtime ValueType.
 * Violated constraints track validation status: undefined = never validated.
 */
export abstract class DataNode implements IValueAccess {
  // #region ── Fields ────────────────────────────────────────────────────────

  /** The runtime value type (schema + runtime info). */
  readonly type: ValueType;

  /** The node parent */
  readonly parent: IValueAccess | undefined;

  /** The value */
  private _value: unknown;

  /** Violated constraint names. undefined = never validated, [] = valid. */
  private _violated?: string[];

  /** The override properties */
  private _props?: Map<(new () => IProperty), { source: IValueAccess, level: number, property: IProperty }[]>;

  /** The data observable */
  private _dataOb?: Observable;

  /** The state observable */
  private _stateOb?: Observable;

  /** The property observable */
  private _propObs?: Map<(new () => IProperty), Observable>;

  // #endregion

  // #region ── ctor & dtor ───────────────────────────────────────────────────

  /** Construct the data node with value type, parent and init value */
  constructor(type: ValueType, value: unknown, parent: IValueAccess | undefined = undefined) {
    this.type = type;
    this.parent = parent;
    this.trySetValue(value);
  }

  /** Dipose the data node, release references */
  dispose() {
    delete this._props;
    delete this._value;
    delete this._violated;
  }

  // #endregion

  // #region ── Value Access ──────────────────────────────────────────────────

  /** Whether this node holds no value. */
  get isEmpty(): boolean { return isEmpty(this._value) }

  /** Try to set a typed value. Returns true on success. */
  trySetValue<T>(value: T): boolean{
    this._value = value;
    this._dataOb?.onNext(value);
    return true;
  }

  /** Clear the stored value. */
  clearValue(): void { this.trySetValue(null); }

  /** Gets the value */
  getValue(): unknown { return this._value }

  // #endregion
  
  // #region ── Property Access ───────────────────────────────────────────────

  /** Gets the property */
  getProperty(propCtor: new () => IProperty): IProperty | undefined {
    if (this._props?.has(propCtor))
    {
      const props = this._props.get(propCtor)!;
      const prop = props.length ? props[0].property : undefined
      if (prop) return prop;
    }
    return this.type.getProperty(propCtor);
  }

  /** Gets the properties */
  *getProperties(propCtor: new () => IProperty): Generator<IProperty> {
    if (this._props?.has(propCtor))
    {
      const props = this._props.get(propCtor)!;
      for(let i = 0 ;i < props.length; i++)
      {
        const prop = props[i].property;
        yield prop;
        if (!prop.stackable) return;
      }
    }
    for(let prop of this.type.getProperties(propCtor))
    {
      yield prop;
      if (!prop.stackable) return;
    }
  }

  /** Sets the property */
  setProperty(property: IProperty, source?: IValueAccess): void {
    source ??= this;

    this._props ??= new Map();
    const propCtor = property.constructor as new()=>IProperty;
    const props = this._props.get(propCtor);
    if (props)
    {
      if (property.hasValue)
      {
        const exist = props?.find(p => p.source === source);
        if (exist)
        {
          if (isEqual(exist.property.getValue(), property.getValue())) return;
          exist.property = property;
        }
        else
        {
          props.push({ source, level: this.calcLevel(source), property });
          props.sort((a, b) => b.level - a.level); // keep order
        }
      }
      else
      {
        if (!props.some(d => d.source === source)) return;
        this._props.set(propCtor, props.filter(d => d.source !== source));
      }
    }
    else if (property.hasValue)
    {
      this._props.set(propCtor, [{ source, level: this.calcLevel(source), property }]);
    }
    else
      return;
    this._stateOb?.onNext(propCtor);
  }

  /** Sets the value of the given property */
  setPropertyValue(propCtor: new () => IProperty, value?: unknown, source?: IValueAccess): void {
    if (isEmpty(value))
    {
      if (this._props && this._props.has(propCtor))
      {
        source ??= this;
        this._props.set(propCtor, this._props.get(propCtor)!.filter(d => d.source !== source));
      }
    }
    else
    {
      const prop = new propCtor();
      prop.setValue(value);
      this.setProperty(prop, source);
    }
  }

  // #endregion

  // #region ── Subscription ──────────────────────────────────────────────────

  /** Subscribe the data change and return the function for un-subsribe */
  subscribe(func: Function, immediate?: boolean): Function {
    throw new Error('Method not implemented.');
  }

  /** Subscribe the node state changes(any property changed) and return the function for un-subscribe */
  subscribeState(func: Function, immediate?: boolean): Function {
    throw new Error('Method not implemented.');
  }

  /** Subscribe the node property change and return the function for un-subscribe */
  subscribeProperty(func: Function, propCtor: new () => IProperty, immediate?: boolean): Function {
    throw new Error('Method not implemented.');
  }

  /** Record subscription by source */
  recordSubscription(source: unknown, subscription: Function): void {
    throw new Error('Method not implemented.');
  }

  /** Clear subscriptions by souce */
  clearSubscription(source: unknown): void {
    throw new Error('Method not implemented.');
  }

  // #endregion

  // #region ── Path Navigation ───────────────────────────────────────────────

  /**
   * Navigate a dotted path relative to this node.
   * Mirrors C# DataNode.GetAccessValue(string path).
   * Supports: $self, field names, array indices.
   */
  getAccessValue(path: string, node: IValueAccess | undefined = undefined): IValueAccess | undefined {
    if (!path || path === '$self') return this;

    // Split by '.' for compound paths
    const parts = path.split('.');
    let current: IValueAccess | undefined = this;
    for (const part of parts) {
      if (!current) return undefined;
      current = current.getAccessValue(part, node);
    }
    return current;
  }

  // #endregion

  // #region ── Validation ────────────────────────────────────────────────────

  /** Violated constraint names. undefined = never validated. */
  get violated(): string[] | undefined { return this._violated; }

  /** Whether the node passed all constraint validations. */
  get isValid(): boolean { return !this._violated || this._violated.length === 0; }

  /** Set violated (and optional passed) constraints. */
  setViolated(
    violated?: IProperty[] | string[] | null,
    passed?: IProperty[] | string[] | null,
    reset?: boolean,
  ): void {
    const toNames = (items?: IProperty[] | string[] | null): string[] =>
      !items ? [] : items.map(i => typeof i === 'string' ? i : i.name);

    const vNames = toNames(violated);
    const pNames = toNames(passed);

    let result = reset || !this._violated
      ? vNames
      : [...this._violated, ...vNames];

    result = result.filter(n => !pNames.includes(n));
    this._violated = result.length > 0 ? result : [];
  }

  /** Clear specific passed constraints. */
  clearViolated(passed?: IProperty[] | string[]): void {
    this.setViolated(null, passed, false);
  }

  // #endregion

  // #region ── Utility ───────────────────────────────────────────────────────

  /** Clone this data node. */
  abstract clone(): DataNode;

  /** Equality check. */
  equals(other: DataNode | undefined): boolean {
    if (!other) return this.isEmpty;
    if (this === other) return true;
    if (this.isEmpty) return other.isEmpty;
    return isEqual(this.getValue<unknown>(), other.getValue<unknown>());
  }

  toString(): string {
    const val = this.getValue<string>();
    return isEmpty(val) ? '' : `${val}`;
  }

  private calcLevel(source: IValueAccess)
  {
    let level = 0;
    let curr: IValueAccess | undefined = this;
    while(curr && curr !== source)
    {
      level++;
      curr = curr.parent;
    }
    return level;
  }

  // #endregion
}
