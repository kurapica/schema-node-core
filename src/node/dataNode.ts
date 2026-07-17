// =============================================================================
// DataNode — abstract base for all data-holding nodes
// Mirrors C# SchemaNode.Core/Node/DataNode.cs
// =============================================================================

import type { ValueType } from '../runtime/type/valueType';
import type { IProperty } from '../property/property';
import { IPropertyProvider, IValueAccess } from '../runtime/interfaces';
import { deepClone, generateGuid, isEmpty, isEqual } from '../utility/toolset';
import { Observable } from '../utility/observable';
import { NODE_SELF } from '../utility/constant';
import { Name } from '../property/core/name';
import { Display, DisplayOnly, Immutable, ReadOnly, Require } from '../property';
import { Unit } from '../property/common/unit';

/** A DataNode holds a value (or children) governed by a runtime ValueType. */
export abstract class DataNode implements IValueAccess, IPropertyProvider {
  // #region ── Fields ────────────────────────────────────────────────────────

  /** The guid of the node */
  readonly id = generateGuid();

  /** The runtime value type (schema + runtime info). */
  readonly type: ValueType;

  /** The node parent */
  readonly parent: IValueAccess | undefined;

  /** The value */
  protected _value: unknown;

  /** Violated constraint names. undefined = never validated, [] = valid. */
  private _violated?: string[];

  /** The alternative property provider  */
  private _propProvider?: IPropertyProvider;

  /** The override properties */
  private _props?: Map<(new () => IProperty), { source: IValueAccess, level: number, property: IProperty }[]>;

  /** The data observable */
  private _dataOb?: Observable;

  /** The state observable */
  private _stateOb?: Observable;

  /** The property observable */
  private _propObs?: Map<(new () => IProperty), Observable>;

  /** The subscrptions */
  private _subs?: Map<unknown, Set<Function>>;

  /** The original value */
  protected _original: unknown;

  // #endregion

  // #region ── ctor & dtor ───────────────────────────────────────────────────

  /** Construct the data node with value type, parent and init value */
  constructor(type: ValueType, value: unknown, parent: IValueAccess | undefined = undefined) {
    this.type = type;
    this.parent = parent;
    this.setValue(value);
    this.confirm();
  }

  /** Dipose the data node, release references */
  dispose() {
    this._dataOb?.dispose();
    this._stateOb?.dispose();
    this._propObs?.forEach(p => p.dispose());
    this._propObs?.clear();
    this._subs?.forEach(s => s.forEach(f => f()))
    this._subs?.clear();

    delete this._dataOb;
    delete this._stateOb;
    delete this._propObs;
    delete this._subs;
    delete this._props;
    delete this._value;
    delete this._violated;
  }

  // #endregion

  // #region ── Value Access ──────────────────────────────────────────────────

  /** Sets the value. */
  setValue(value: unknown): void{
    if (isEqual(this._value, value)) return;
    this._value = value;
    this.onNext();
  }

  /** Gets the value */
  getValue(): unknown { return deepClone(this._value) }

  /** Gets the value */
  get value() { return this.getValue() }

  /** Sets the value */
  set value(value: unknown) { this.setValue(value) }

  /** Whether this node holds no value. */
  get isEmpty(): boolean { return isEmpty(this._value) }

  /** Gets the raw value */
  get rawValue() { return this._value }

  /** Gets the original value */
  get original() { return deepClone(this._original) }

  /** Gets the submit value */
  get submitValue() { return this.value }

  /** Whether the data node changed */
  get changed(): boolean { return !isEqual(this._original, this._value) }

  /** Confirm the changes and save to original */
  confirm(): void { this._original = deepClone(this.getValue()) }

  /** Reset the data node value */
  reset(): void { this.setValue(deepClone(this._original)) }

  // #endregion
  
  // #region ── Property Access ───────────────────────────────────────────────

  /** Shortcut to gets the node name */
  get name() { return this.getPropertyValue(Name) }

  /** Shortcut to gets the dislay of the node */
  get display() { return this.getPropertyValue(Display) }

  /** Shortcut to gets whether the node is require */
  get require() { return this.getPropertyValue(Require) }

  /** Shortcut to gets whether the node is readonly */
  get readonly() { return this.getPropertyValue(ReadOnly) || this.getPropertyValue(DisplayOnly) || this.getPropertyValue(Immutable) && !isEmpty(this._original) }

  /** Shortcut to gets the unit */
  get unit() { return this.getPropertyValue(Unit) }

  /** Set alternative property provider */
  setPropertyProvider(provider?: IPropertyProvider) { 
    if (this._propProvider == provider) return;
    this._propProvider = provider;
    this.onNextState(); // can't publish property changes here
  }

  /** Gets the property */
  getProperty(propCtor: new () => IProperty): IProperty | undefined {
    if (this._props?.has(propCtor))
    {
      const props = this._props.get(propCtor)!;
      const prop = props.length ? props[0].property : undefined
      if (prop) return prop;
    }
    return (this._propProvider ?? this.type).getProperty(propCtor);
  }

  /** Gets the property value */
  getPropertyValue(propCtor: new() => IProperty): unknown
  {
    return this.getProperty(propCtor)?.getValue();
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
    for(let prop of (this._propProvider ?? this.type).getProperties(propCtor))
    {
      yield prop;
      if (!prop.stackable) return;
    }
  }

  /** Gets the property values */
  *getPropertyValues(propCtor: new() => IProperty): Generator<unknown>{
    for (let prop of this.getProperties(propCtor))
    {
      yield prop.getValue();
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
    this.onNextState(propCtor, property.getValue());
    this.onNextProperty(propCtor, property.getValue());
  }

  /** Sets the value of the given property */
  setPropertyValue(propCtor: new () => IProperty, value?: unknown, source?: IValueAccess): void {
    if (isEmpty(value))
    {
      const props = this._props?.get(propCtor);
      if (props?.length)
      {
        source ??= this;
        if (!props.some(d => d.source === source)) return;
        this._props!.set(propCtor, props.filter(d => d.source !== source));
        this._stateOb?.onNext(propCtor, undefined);
        this._propObs?.get(propCtor)?.onNext(undefined);
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
    this._dataOb ??= new Observable();
    const sub = this._dataOb.subscribe(func);
    if (immediate) func(this._value);
    return sub;
  }

  /** Publish the value change */
  onNext() { this._dataOb?.onNext(this._value);  }

  /** Subscribe the node state changes(any property changed) and return the function for un-subscribe */
  subscribeState(func: Function, immediate?: boolean): Function {
    this._stateOb ??= new Observable();
    const sub = this._stateOb.subscribe(func);
    if (immediate) func();
    return sub;
  }

  /** Publish the state change */
  onNextState(propCtor: (new() => IProperty) | undefined = undefined, value: unknown | undefined = undefined) { this._stateOb?.onNext(propCtor, value); }

  /** Subscribe the node property change and return the function for un-subscribe */
  subscribeProperty(propCtor: new () => IProperty, func: Function, immediate?: boolean): Function {
    this._propObs ??= new Map();
    let ob = this._propObs.get(propCtor);
    if (!ob){
      ob = new Observable();
      this._propObs.set(propCtor, ob);
    }
    const sub = ob.subscribe(func);
    if (immediate) func(this.getPropertyValue(propCtor))
    return sub;
  }

  /** Publish the property value change */
  onNextProperty(propCtor: new() => IProperty, value: unknown)
  {
    this._propObs?.get(propCtor)?.onNext(value);
  }

  /** Record subscription by source */
  recordSubscription(subscription: Function, source: unknown = undefined): void {
    source ??= this;
    this._subs ??= new Map();
    let subs = this._subs.get(source);
    if (subs)
      subs.add(subscription);
    else
    {
      subs = new Set();
      subs.add(subscription);
      this._subs.set(source, subs);
    }
  }

  /** Clear subscriptions by souce */
  clearSubscription(source?: unknown): void {
    source ??= this;
    const subs = this._subs?.get(source);
    if (subs)
    {
      this._subs!.delete(source);
      subs.forEach(s => s());
      subs.clear();
    }
  }

  // #endregion

  // #region ── Path Navigation ───────────────────────────────────────────────

  /**
   * Navigate a dotted path relative to this node.
   * Mirrors C# DataNode.GetAccessValue(string path).
   * Supports: $self, field names, array indices.
   */
  getAccessValue(path: string, node: IValueAccess | undefined = undefined): IValueAccess | undefined {
    return isEmpty(path) || path === NODE_SELF ? this : undefined;
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
  clone(): DataNode {
    const ctor = this.constructor as new (type: ValueType, value: unknown, parent: IValueAccess | undefined) => DataNode;
    return new ctor(this.type, this.getValue(), this.parent);
  }

  /** Equality check. */
  equals(other: DataNode | undefined): boolean {
    if (!other) return this.isEmpty;
    if (this === other) return true;
    if (this.isEmpty) return other.isEmpty;
    return isEqual(this.getValue(), other.getValue());
  }

  toString(): string {
    const val = this.getValue();
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
