// =============================================================================
// DataNode — abstract base for all data-holding nodes
// Mirrors C# SchemaNode.Core/Node/DataNode.cs
// =============================================================================

import { clearDebounce, debounce, deepClone, generateGuid, isEmpty, isEqual, isNull, trimValue } from '../../utility/toolset';
import { Observable } from '../../utility/observable';
import { _LS } from '../../utility/locale';
import { getPropertiesBySchemaKind } from '../../property/propertyOwner';
import { isRelation, joinProperties, isConstraintProperty } from '../../interface';
import { getPropertyName } from '../../property/property';
import { formatLocaleString } from '../../struct/localeString/type';

import type { Observer } from '../../utility/observable';
import type { IPropertyProvider, IRelation, IRelationInfo, IValueAccess, IProperty, PropertyCtor, IConstraintProperty } from '../../interface';
import type { IValueTypeAccess } from '../../interface';

import { NODE_SELF, DEBOUNCE_TIME, SCHEMA_KIND_NODE } from '../../utility/constant';
import { logger } from '../../utility/logger';

/** A DataNode holds a value (or children) governed by a runtime ValueType. */
export class DataNode implements IValueAccess, IPropertyProvider {
  // #region ── Fields ────────────────────────────────────────────────────────

  /** The guid of the node */
  readonly id = generateGuid();

  /** The runtime value type (schema + runtime info). */
  readonly type: IValueTypeAccess;

  /** The node parent */
  readonly parent: IValueAccess | undefined;

  /** The alternative property provider  */
  readonly propertyProvider?: IPropertyProvider;

  /** The value */
  private _value: unknown;

  /** The original value */
  private _original: unknown;

  /** The violated constraint properties(not from relations) */
  private _violated?: IConstraintProperty[];

  /* avoid double validation */
  private _validated?: boolean;

  /** The override properties(from relations) */
  private _props?: Map<PropertyCtor, IPropertyRecord[]>;

  /** The data observable */
  private _dataOb?: Observable<[IValueAccess, unknown]>;

  /** The violated observable */
  private _violatedOb?: Observable<[IValueAccess, boolean]>;

  /** The self property observable */
  private _selfPropObs?: Map<PropertyCtor, Observable<[IValueAccess, PropertyCtor, unknown, unknown]>>;

  /** The property observable */
  private _propObs?: Map<PropertyCtor, Observable<[IValueAccess, PropertyCtor, unknown, unknown]>>;

  /** The subscrptions */
  private _subs?: Map<unknown, Set<Function>>;

  // #endregion

  // #region ── ctor & dtor ───────────────────────────────────────────────────

  /** Construct the data node with value type, parent and init value, alternative property provider */
  constructor(type: IValueTypeAccess, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    this.type = type;
    this.parent = parent;
    this.propertyProvider = propProvider;
    if (!isEmpty(value))
    {
      this.setValue(value);
      this.confirm();
    }

    // init properties effect
    if (!parent) // chilren node should be applied by its parent after confirmed
      this.applyPropertyEffects();
  }

  /** Dipose the data node, release references */
  dispose() {
    this._dataOb?.dispose();
    this._selfPropObs?.forEach(p => p.dispose());
    this._selfPropObs?.clear();
    this._propObs?.forEach(p => p.dispose());
    this._propObs?.clear();
    this._subs?.forEach(s => s.forEach(f => f()))
    this._subs?.clear();
    this._violatedOb?.dispose();

    delete this._dataOb;
    delete this._violatedOb;  
    delete this._selfPropObs;
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
  get name(): string | undefined { return this.getPropertyValue<string>('Name') }

  /** Shortcut to gets the full access path */
  get access(): string {
    let node: DataNode | undefined = this;
    const names: string[] = [];
    while (node) {
      const name = node.name;
      if (!name) break;
      names.push(name);
      node = node.parent as DataNode | undefined;
    }
    return names.reverse().join('.');
  }

  /** Shortcut to gets whether the node is require */
  get require() { return this.getPropertyValue<boolean>("Require") }

  /** Shortcut to gets whether the node is readonly */
  get readonly() { return this.getPropertyValue<boolean>("ReadOnly") ?? false }

  /** shortcut to gets visiblity */
  get visible() { return !this.getPropertyValue<boolean>("InVisible") && this.getPropertyValue<boolean>("Visible") != false }

  /** shortcut to check if the node is display-only */
  get displayOnly() { return this.getPropertyValue<boolean>("DisplayOnly") }

  /** Whether the node has disable constraint */
  get disableConstraint():boolean { return this.getPropertyValue<boolean>("DisableConstraint") || (this.parent instanceof DataNode) && this.parent.disableConstraint }

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

  /** Gets the submit value */
  get submitValue(): unknown { return this.getValue() }

  /** Confirm the changes and save to original */
  confirm(): void { this._original = this.value }

  /** Reset the data node value */
  reset(): void { this.value = this.original }

  // #endregion
  
  // #region ── Property Access ───────────────────────────────────────────────

  /** Apply property effects */
  applyPropertyEffects() {
    for(const prop of Array.from(this.filterProperties(() => true)))
      prop.effect(this, prop.getValue());
  }

  /** Gets the property */
  getProperty<T extends IProperty>(propCtor: PropertyCtor | string): T | undefined {
    let props: IPropertyRecord[] | undefined = undefined;
    if (typeof propCtor === 'string') {
      if (this._props)
      {
        for (const p of this._props.keys())
        {
          if (getPropertyName(p).toLowerCase() === propCtor.toLowerCase())
          {
            props = this._props.get(p);
            break;
          }
        }
      }
    }
    else
    {
      props = this._props?.get(propCtor);
    }
    return props?.length ? props[0].property as T : (this.propertyProvider ?? this.type).getProperty<T>(propCtor);
  }

  /** Gets the property value */
  getPropertyValue<T>(propCtor: PropertyCtor | string): T | undefined { return this.getProperty(propCtor)?.getValue() as T; }

  /** Gets the properties */
  *getProperties<T extends IProperty>(propCtor: PropertyCtor | string): Generator<T> {
    let props: IPropertyRecord[] | undefined = undefined;
    if (typeof propCtor === 'string') {
      if (this._props)
      {
        for (const p of this._props.keys())
        {
          if (getPropertyName(p).toLowerCase() === propCtor.toLowerCase())
          {
            props = this._props.get(p);
            break;
          }
        }
      }
    }
    else
    {
      props = this._props?.get(propCtor);
    }
    for (let prop of joinProperties(props?.map(p => p.property as T), (this.propertyProvider ?? this.type).getProperties<T>(propCtor))) yield prop as T;
  }

  /** Gets the property values */
  *getPropertyValues<T>(propCtor: PropertyCtor | string): Generator<T> { for (let prop of this.getProperties(propCtor)) yield prop.getValue() as T; }

  /** Filters the properties */
  *filterProperties<T extends IProperty>(predicate: (prop: IProperty) => boolean): Generator<IProperty> {
    for (let prop of joinProperties(this._filterProperties<T>(predicate), (this.propertyProvider ?? this.type).filterProperties(predicate))) yield prop;
  }

  private *_filterProperties<T extends IProperty>(predicate: (prop: IProperty) => boolean): Generator<IProperty> {
    if (!this._props) return;
    for(let props of this._props.values())
    {
      if (!props.length) continue;
      const first = props[0].property as T;
      if (predicate(first)) yield first;
      if (first.stackable) {
        for (let i = 1; i < props.length; i++)
          if (predicate(props[i].property as T)) yield props[i].property as T;
      }
    }
  }

  /** Sets the property values */
  setPropertyValues(props: Record<string, unknown>, source?: IValueAccess, ...kinds: string[]) {
    if (!kinds.includes(this.type.kind)) kinds.push(this.type.kind);
    if (!kinds.includes(SCHEMA_KIND_NODE)) kinds.push(SCHEMA_KIND_NODE);

    for (const kind of kinds)
      for (const prop of getPropertiesBySchemaKind(props, kind))
        this.setPropertyValue(prop.constructor as any, prop.getValue(), source);
  }

  /** Sets the value of the given property */
  setPropertyValue<T>(propCtor: PropertyCtor, value?: T, source?: IValueAccess): void {
    source ??= this;

    let oldValue = this.getPropertyValue<T>(propCtor);
    let props = this._props?.get(propCtor);
    let record = props?.find(p => p.source === source);

    value = trimValue(value);

    // clear
    if (isEmpty(value)) {
      if (!record || !record.property.hasValue) return;
      record.property.setValue(value);
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
      record = { source, level: calcLevel(this, source), property: new propCtor(source) };
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
    if (!props?.length || props[0].level <= record.level) {
      record.property.effect(this, record.property.getValue(), oldValue, source); // apply side effect
      this.onNextProperty(propCtor, record.property.getValue(), oldValue);
    }
  }

  // #endregion

  // #region ── Subscription ──────────────────────────────────────────────────

  /** Subscribe the data change and return the function for un-subsribe */
  subscribe(func: Observer<[IValueAccess, unknown]>, immediate?: boolean): Function {
    this._dataOb ??= new Observable();
    const sub = this._dataOb.subscribe(func);
    if (immediate) func(this, this.rawValue);
    return sub;
  }

  /** Publish the value change */
  onNext = debounce(() => {
    this._dataOb?.onNext(this, this.rawValue);
    this._validated = false;
    this.validate();
  }, DEBOUNCE_TIME);
   
  /** Subscribe self property change and return the function for un-subscribe */
  protected subscribeSelfProperty(propCtor: PropertyCtor, func: Observer<[IValueAccess, PropertyCtor, unknown, unknown]>, immediate?: boolean): Function {
    this._selfPropObs ??= new Map();
    let ob = this._selfPropObs.get(propCtor);
    if (!ob){
      ob = new Observable();
      this._selfPropObs.set(propCtor, ob);
    }
    const sub = ob.subscribe(func);
    if (immediate) func(this, propCtor, this.getPropertyValue(propCtor), undefined);
    return sub;
  }

  /** Subscribe the node property change and return the function for un-subscribe */
  subscribeProperty(propCtor: PropertyCtor, func: Observer<[IValueAccess, PropertyCtor, unknown, unknown]>, immediate?: boolean): Function {
    this._propObs ??= new Map();
    let ob = this._propObs.get(propCtor);
    if (!ob){
      ob = new Observable();
      this._propObs.set(propCtor, ob);
    }
    const sub = ob.subscribe(func);
    if (immediate) func(this, propCtor, this.getPropertyValue(propCtor), undefined);
    return sub;
  }

  /** Publish the property value change */
  onNextProperty(propCtor: PropertyCtor, newValue?: unknown, oldValue?: unknown)
  {
    let ob = this._selfPropObs?.get(propCtor);
    if (ob) ob.onNext(this, propCtor, newValue, oldValue);

    ob = this._propObs?.get(propCtor);
    if (ob) ob.onNext(this, propCtor, newValue, oldValue);
  }

  /** Subscribe the violated constraints and return the function for un-subscribe */
  subscribeViolated(func: Observer<[IValueAccess, boolean]>, immediate?: boolean): Function {
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

  /** Get attached relations */
  *getAttachedRelations(predicate?: (relation: IRelation) => boolean): Generator<IRelation> {
    if (!this._subs) return;
    for(const source of this._subs.keys())
    {
      if (isRelation(source) && (!predicate || predicate(source)))
        yield source;
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

  /** Move subscriptions to new node before destroying this node */
  moveSubscription(newNode: DataNode): void {
    newNode._dataOb = this._dataOb;
    newNode._propObs = this._propObs;
    newNode._violatedOb = this._violatedOb;

    this._dataOb = undefined;
    this._propObs = undefined;
    this._violatedOb = undefined;
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

  /** Get error nodes */
  *getErrorNodes(): Generator<IValueAccess> {
    if (!(this.violated().next().done ?? false)) yield this;
  }

  /** The error message if the node is invalid. */
  get error(): string | undefined {
    let hasError = false;
    for (const prop of this.violated())
    {
      const msg = prop.error(this);
      if (msg) return msg;
      hasError = true;
    }
    return hasError ? formatLocaleString("VALUE_NOT_VALID", this.getPropertyValue("Display") ?? this.getPropertyValue("Name")) : undefined;
  }

  /** Whether the node passed all constraint validations. */
  get isValid(): boolean { return this.disableConstraint || (this.violated().next().done ?? false); }

  /** Validate the node. */
  async validate() {
    if (this.disableConstraint) 
      return;

    if (this._validated) return;
    this._validated = true;
    
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
    logger.verbose('[Constraint]', this.access, constraint.name, valid);
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

  /** Clear the violated constraint properties. */
  clearConstraints() {
    this._violated = undefined;
    this._validated = false;
    
    if (this._props) {
      for(const records of this._props.values()) {
        if (!records.length || !isConstraintProperty(records[0].property)) continue;
        for(const record of records) {
          record.valid = undefined;
        }
      }
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

  // #endregion
}

/** Calculate the distance to the source node. */
function calcLevel(self: IValueAccess, source: IValueAccess)
{
  let level = 0;
  let curr: IValueAccess | undefined = self;
  while(curr && curr !== source)
  {
    level++;
    curr = curr.parent;
  }
  return level;
}

interface IPropertyRecord {
  source: IValueAccess;
  level: number;
  property: IProperty;
  valid?: boolean;
}