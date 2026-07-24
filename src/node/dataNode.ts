// =============================================================================
// DataNode — abstract base for all data-holding nodes
// Mirrors C# SchemaNode.Core/Node/DataNode.cs
// =============================================================================

import type { ValueType } from '../runtime/type/valueType';
import type { IProperty } from '../property/property';
import { IPropertyProvider, IRelationInfo, IValueAccess, joinProperties } from '../runtime/interfaces';
import { clearDebounce, debounce, deepClone, generateGuid, isEmpty, isEqual, isNull } from '../utility/toolset';
import { Observable } from '../utility/observable';
import { NODE_SELF } from '../utility/constant';
import { Name } from '../property/core/name';
import { DisplayOnly, Immutable, InVisible, ReadOnly, Require, Visible } from '../property';
import { IConstraintProperty, isConstraintProperty } from '../property/constraintProperty';

const DEBOUNCE_TIME = 20;

/** A DataNode holds a value (or children) governed by a runtime ValueType. */
export abstract class DataNode implements IValueAccess, IPropertyProvider {
  // #region ── Fields ────────────────────────────────────────────────────────

  /** The guid of the node */
  readonly id = generateGuid();

  /** The runtime value type (schema + runtime info). */
  readonly type: ValueType;

  /** The node parent */
  readonly parent: IValueAccess | undefined;

  /** The alternative property provider  */
  readonly propertyProvider?: IPropertyProvider;

  /** The value */
  protected _value: unknown;

  /** The original value */
  protected _original: unknown;

  /** The violated constraint properties(not from relations) */
  private _violated?: IConstraintProperty[];

  /** The override properties(from relations) */
  private _props?: Map<(new () => IProperty), IPropertyRecord[]>;

  /** The data observable */
  private _dataOb?: Observable;

  /** The state observable */
  private _stateOb?: Observable;

  /** The violated observable */
  private _violatedOb?: Observable;

  /** The property observable */
  private _propObs?: Map<(new () => IProperty), Observable>;

  /** The subscrptions */
  private _subs?: Map<unknown, Set<Function>>;

  // #endregion

  // #region ── ctor & dtor ───────────────────────────────────────────────────

  /** Construct the data node with value type, parent and init value, alternative property provider */
  constructor(type: ValueType, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    this.type = type;
    this.parent = parent;
    this.propertyProvider = propProvider;
    if (!isEmpty(value))
    {
      this.setValue(value);
      this.confirm();
    }
  }

  /** Dipose the data node, release references */
  dispose() {
    this._dataOb?.dispose();
    this._stateOb?.dispose();
    this._propObs?.forEach(p => p.dispose());
    this._propObs?.clear();
    this._subs?.forEach(s => s.forEach(f => f()))
    this._subs?.clear();
    this._violatedOb?.dispose();

    delete this._dataOb;
    delete this._stateOb;
    delete this._violatedOb;  
    delete this._propObs;
    delete this._subs;
    delete this._props;
    delete this._value;
    delete this._violated;
    clearDebounce(this.onNext);
    clearDebounce(this.onNextViolated);
  }

  // #endregion

  // #region ── Shortcuts ──────────────────────────────────────────────────

  /** Shortcut to gets the node name */
  get name(): string | undefined { return this.getPropertyValue(Name) as string }

  /** Shortcut to gets whether the node is require */
  get require() { return this.getPropertyValue(Require) }

  /** Shortcut to gets whether the node is readonly */
  get readonly() { return this.getPropertyValue(ReadOnly) || this.getPropertyValue(DisplayOnly) || this.getPropertyValue(Immutable) && !isEmpty(this._original) }

  /** shortcut to gets visiblity */
  get visible() { return !this.getPropertyValue(InVisible) && this.getPropertyValue(Visible) != false }

  /** shortcut to check if the node is display-only */
  get displayOnly() { return this.getPropertyValue(DisplayOnly) }

  // #endregion

  // #region ── Value Access ──────────────────────────────────────────────────

  /** Sets the value. */
  setValue(value: unknown): void{
    if (this._value === value) return;
    this._value = value;

    // notify changes
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

  /** Whether the data node changed */
  get changed(): boolean { return !isEqual(this._original, this._value) }

  /** Confirm the changes and save to original */
  confirm(): void { this._original = this.value }

  /** Reset the data node value */
  reset(): void { this.value = this.original }

  // #endregion
  
  // #region ── Property Access ───────────────────────────────────────────────

  /** Gets the property */
  getProperty<T extends IProperty>(propCtor: new () => T): T | undefined {
    const props = this._props?.get(propCtor);
    return props?.length ? props[0].property as T : (this.propertyProvider ?? this.type).getProperty<T>(propCtor);
  }

  /** Gets the property value */
  getPropertyValue(propCtor: new() => IProperty): unknown { return this.getProperty(propCtor)?.getValue(); }

  /** Gets the properties */
  *getProperties<T extends IProperty>(propCtor: new () => T): Generator<T> {
    return joinProperties(this._props?.get(propCtor)?.map(p => p.property as T), (this.propertyProvider ?? this.type).getProperties<T>(propCtor));
  }

  /** Gets the property values */
  *getPropertyValues(propCtor: new() => IProperty): Generator<unknown>{ for (let prop of this.getProperties(propCtor)) yield prop.getValue(); }

  /** Filters the properties */
  *filterProperties<T extends IProperty>(predicate: (prop: IProperty) => boolean): Generator<IProperty> {
    return joinProperties(...(this._props?.values()?.filter(v => v.length && predicate(v[0].property))?.map(v => v.map(p => p.property as T)) ?? []), (this.propertyProvider ?? this.type).filterProperties(predicate));
  }

  /** Sets the value of the given property */
  setPropertyValue(propCtor: new () => IProperty, value?: unknown, source?: IValueAccess): void {
    source ??= this;

    let props = this._props?.get(propCtor);
    let record = props?.find(p => p.source === source);

    // clear
    if (isEmpty(value)) {
      if (!record) return;
      props = props!.filter(d => d.source !== source)
      this._props!.set(propCtor, props);
    }
    // set
    else if (record)
    {
      if (isEqual(record.property.getValue(), value)) return;
      record.property.setValue(value);
    }
    else
    {
      this._props ??= new Map();
      record = { source, level: this.calcLevel(source), property: new propCtor() };
      record.property.setValue(value);
      if (props) {
        props.push(record);
        props.sort((a, b) => b.level - a.level); // keep order
      }
      else
      {
        props = [record];
      }
      this._props.set(propCtor, props);
    }

    // Validate constraint
    if (isConstraintProperty(record.property)) {
      if (isEmpty(value))
      {
        if (record.valid == false) // clear violated
          this.onNextViolated();
      }
      else
      {
        // validate
        (record.property as IConstraintProperty).validate(this).then((res?: boolean) => {
          if (res != record.valid)
          {
            record.valid = res;
            this.onNextViolated();
          }
        }).catch(ex => console.error(ex))
      }
    }

    // public property change
    if (!props?.length || props[0].level <= record.level)
      this.onNextProperty(propCtor);
  }

  // #endregion

  // #region ── Subscription ──────────────────────────────────────────────────

  /** Subscribe the data change and return the function for un-subsribe */
  subscribe(func: Function, immediate?: boolean): Function {
    this._dataOb ??= new Observable();
    const sub = this._dataOb.subscribe(func);
    if (immediate) func(this, this.rawValue);
    return sub;
  }

  /** Publish the value change */
  onNext = debounce(() => { 
    this._dataOb?.onNext(this, this.rawValue);
    this.validate();
  }, DEBOUNCE_TIME);

  /** Subscribe the node state changes(any property changed) and return the function for un-subscribe */
  subscribeState(func: Function, immediate?: boolean): Function {
    this._stateOb ??= new Observable();
    const sub = this._stateOb.subscribe(func);
    if (immediate) func(this);
    return sub;
  }

  /** Publish the state change */
  onNextState(propCtor?: (new() => IProperty)) {
    if (!this._stateOb) return;
    this._stateOb.onNext(this, propCtor, propCtor ? this.getPropertyValue(propCtor) : undefined); 
  }

  /** Subscribe the node property change and return the function for un-subscribe */
  subscribeProperty(propCtor: new () => IProperty, func: Function, immediate?: boolean): Function {
    this._propObs ??= new Map();
    let ob = this._propObs.get(propCtor);
    if (!ob){
      ob = new Observable();
      this._propObs.set(propCtor, ob);
    }
    const sub = ob.subscribe(func);
    if (immediate) func(this, propCtor, this.getPropertyValue(propCtor))
    return sub;
  }

  /** Publish the property value change */
  onNextProperty(propCtor: new() => IProperty)
  {
    const ob = this._propObs?.get(propCtor);
    if (ob) ob.onNext(this, propCtor, this.getPropertyValue(propCtor));
    this.onNextState(propCtor);
  }

  /** Subscribe the violated constraints and return the function for un-subscribe */
  subscribeViolated(func: Function, immediate?: boolean): Function {
    this._violatedOb ??= new Observable();
    const sub = this._violatedOb.subscribe(func);
    if (immediate) func(this, this.isValid);
    return sub;
  }

  /** Publish the violated constraints */
  onNextViolated = debounce(() => { 
    if (!this._violatedOb) return;
    this._violatedOb.onNext(this, this.isValid);
  }, DEBOUNCE_TIME);

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
  getAccessValue(path: string, node?: IValueAccess): IValueAccess | undefined {
    return isEmpty(path) || path === NODE_SELF ? this : undefined;
  }

  // #endregion

  // #region ── Validation ────────────────────────────────────────────────────

  /** Violated constraint properties */
  *violated(): Generator<IConstraintProperty> {
    const unStackable = new Set<Function>();
    if (this._props) {
      for(const records of this._props.values()) {
        if (!records.length || !isConstraintProperty(records[0].property)) continue;
        for(const record of records) {
          if (isNull(record.valid)) continue;

          if (!record.property.stackable) {
            if (unStackable.has(record.property.constructor)) continue;
            unStackable.add(record.property.constructor);
          }
          if (record.valid !== false) continue;
          yield record.property as IConstraintProperty;
        }
      }
    }

    if (this._violated?.length) {
      for (const prop of this._violated) {
        if (!prop.stackable) {
          if (unStackable.has(prop.constructor)) continue;
          unStackable.add(prop.constructor);
        }
        yield prop;
      }
    }
  }

  /** Whether the node passed all constraint validations. */
  get isValid(): boolean { return this.violated().next().done ?? false; }

  /** Validate the node. */
  async validate() {
    // validate static constraints
    for (const constraint of (this.propertyProvider ?? this.type).filterProperties(isConstraintProperty) as Generator<IConstraintProperty>) {
      this.recordConstraint(constraint, await constraint.validate(this));
    }

    // validate dynamic constraints
    if (this._props) {
      for(const records of this._props.values())
      {
        if (records.length && isConstraintProperty(records[0].property))
        {
          for(const record of records)
          {
            const res = await (record.property as IConstraintProperty).validate(this);
            if (res !== record.valid)
            {
              record.valid = res;
              this.onNextViolated();
            }
            // non-stackable property, only check the top one
            if (!record.property.stackable) break;
          }
        }
      }
    }
  }

  /** Record violated constraint property */
  recordConstraint(constraint: IConstraintProperty, valid?: boolean): void {
    if (valid || isNull(valid)) {
      if (!this._violated?.length) return;
      const index = this._violated.indexOf(constraint as IConstraintProperty);
      if (index !== -1) this._violated.splice(index, 1);
    }
    else {
      this._violated ??= [];
      if (this._violated.indexOf(constraint as IConstraintProperty) !== -1) return;
      this._violated.push(constraint as IConstraintProperty);
    }
    this.onNextViolated();
  }

  // #endregion

  // #region ── Relation ──────────────────────────────────────────────────────

  /** Attach the relations */
  attachRelations(relationInfos: IRelationInfo[]): void {
    relationInfos.forEach(info => {
      info.relations.forEach(r => {
        if (info.owner.getAccessValue(r.target, this) === this)
          r.attach(info.owner, this);
      });
    });
  }

  // #endregion

  // #region ── Utility ───────────────────────────────────────────────────────

  /** Convert to string. */
  toString(): string {
    const val = this.getValue();
    return isEmpty(val) ? '' : `${val}`;
  }

  /** Calculate the distance to the source node. */
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

interface IPropertyRecord {
  source: IValueAccess;
  level: number;
  property: IProperty;
  valid?: boolean;
}