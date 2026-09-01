// =============================================================================
// StructType — runtime type for struct schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/StructType.cs
// =============================================================================

import { getPropertiesBySchemaKind, getProperty, getPropertyValue, setPropertyValue } from '../../property/propertyOwner';
import { isEmpty } from '../../utility/toolset';
import { Attach } from '../../property/core/attach';
import { Display } from '../../property/common/display';
import { DisplayOnly } from './property/displayOnly';
import { Require } from '../../property/common/require';
import { SchemaType } from '../../property/core/schemaType';
import { Unpack } from './property/unpack';
import { Name } from '../../property/core/name';
import { getMetaProperties, getMetaProperty } from '../../attribute/meta';
import { _LS } from '../../utility/locale';
import { PropertyType } from '../property/runtime';
import { ArrayType } from '../array/runtime';
import { ValueType } from '../value/runtime';
import { filterSchemaKindProperties, getSchemaKindProperties, getSchemaKindProperty, getSchemaKindPropertyTypes } from '../../runtime/schemaRuntime';
import { Relations } from '../relation/property';
import { RelationType } from '../relation/runtime';
import { isConstraintProperty, joinProperties } from '../../interface';
import { isTypeRefProperty } from '../../property/typeRefProperty';
import { getNodeType } from '../../runtime/context';
import { logger } from '../../utility';

import type { Entry } from '../../struct/entry/type';
import type { LocaleString } from '../../struct/localeString/type';
import type { StructFieldSchema, StructSchema } from './type';
import type { RelationSchema } from '../relation/type';
import type { IConstraintProperty, IProperty, PropertyCtor, IPropertyProvider, IRelationProvider, INodeReference, INodeType, IRelation } from '../../interface';
import type { ITypeRefProperty } from '../../property/typeRefProperty';
import type { GenericParameter } from '../generic/type';

import { SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_STRUCT, NODE_SELF, SCHEMA_KIND_ARRAY, SCHEMA_KIND_ENUM, SCHEMA_KIND_STRING, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_BOOL, SCHEMA_KIND_DATE, NS_SYSTEM_LOCALE_STRING, SCHEMA_KIND_OBJECT, NS_SYSTEM_RANGE_YEAR, NS_SYSTEM_RANGE_MONTH, NS_SYSTEM_RANGE_DATE, NS_SYSTEM_RANGE_FULL_DATE, NS_SYSTEM_LIST } from '../../utility/constant';

// ── StructType ────────────────────────────────────────────────────────────
const VALUE_TYPE_PRIORITY: Record<string, number> = {
  [SCHEMA_KIND_BOOL]: 9000,
  [SCHEMA_KIND_ENUM]: 8000,
  [SCHEMA_KIND_STRING]: 7000,
  [SCHEMA_KIND_DECIMAL]: 6000,
  [SCHEMA_KIND_DATE]: 5000,
  [SCHEMA_KIND_OBJECT]: 0,
  [SCHEMA_KIND_STRUCT]: 3000,
  [SCHEMA_KIND_ARRAY]: 2000,
}

const STRUCT_TYPE_PRIORITY: Record<string, number> = {
  [NS_SYSTEM_LOCALE_STRING]: 900,
  [NS_SYSTEM_RANGE_YEAR]: 800,
  [NS_SYSTEM_RANGE_MONTH]: 700,
  [NS_SYSTEM_RANGE_DATE]: 600,
  [NS_SYSTEM_RANGE_FULL_DATE]: 500,
}

/** Get the priority of attach property */
function getAttachPropertyPriority(propType: PropertyType)
{
  let priority = VALUE_TYPE_PRIORITY[propType.valueType?.kind ?? ''] ?? 0;
  if (propType.valueType instanceof ArrayType)
    priority += (VALUE_TYPE_PRIORITY[propType.valueType.element?.kind ?? ''] ?? 0) / 10;
  else if (propType.valueType instanceof StructType)
    return priority + (STRUCT_TYPE_PRIORITY[propType.valueType?.name ?? ''] ?? Array.from(propType.valueType.getFields()).length * -10);
  priority += propType.forSchemas?.length ?? 0; // more usable, higher priority
  return priority;
}

/** The runtime struct type */
export class StructType extends ValueType implements IRelationProvider {
  /** Field type definitions. */
  private _fields: StructFieldType[] = [];

  /** Relation types (loaded from Relations property). */
  private _relations: IRelation[] | undefined;

  /** The struct schema data. */
  private _structSchema: StructSchema | undefined;

  // ── Loading ─────────────────────────────────────────────────────────

  override loadProperties(): IProperty[] {
    this._structSchema = getPropertyValue<StructSchema>(this.getNodeSchema(), "struct");
    return this._structSchema ? Array.from(getPropertiesBySchemaKind(this._structSchema, SCHEMA_KIND_STRUCT)) : [];
  }

  override async load(): Promise<void> {
    this._fields = [];
    this._relations = undefined;

    for (const field of this._structSchema?.fields ?? []) {
      const fieldType = new StructFieldType();
      await fieldType.load(field, this.generics, this.genericParams);
      this._fields.push(fieldType);

      // for simple, only check field type now
      if (!fieldType.type)
        console.error(`The struct ${this.name}'s field ${fieldType.name}'s type ${field.type} cant be solved.`)
    }

    // attach properties from type
    const attachKind = getProperty(this._structSchema, Attach)?.getValue<string>();
    const attachFields: { field: StructFieldType, priority: number }[] = [];
    const attachRelations: RelationSchema[] = [];
    if (attachKind) {
      for(const propCtor of getSchemaKindPropertyTypes(attachKind))
      {
        const schemaType = getMetaProperty(propCtor, SchemaType)?.getValue<string>();
        if (!schemaType) continue;
        const propType = await getNodeType(schemaType) as PropertyType;
        if (!propType?.valueType) continue;
        
        const fieldType = new StructFieldType();
        const fieldSchema = { name: propType.property!, type: propType.valueType.name };
        setPropertyValue(fieldSchema, Display, propType.getProperty(Display)?.getValue<LocaleString>());

        // copy properties from meta property type
        for (const prop of getMetaProperties(propCtor).filter((prop) => prop.forSchema(SCHEMA_KIND_STRUCT_FIELD, propType.valueType!.kind, propType.valueType instanceof ArrayType ? propType.valueType.element!.kind : SCHEMA_KIND_STRUCT_FIELD)))
          setPropertyValue(fieldSchema, prop.constructor as PropertyCtor, prop.getValue());

        await fieldType.load(fieldSchema);
        attachFields.push({ field: fieldType, priority: getAttachPropertyPriority(propType) });

        // save property relations
        const propRelations = propType.getProperty(Relations)?.getValue<RelationSchema[]>();
        if (propRelations?.length) attachRelations.push(...propRelations);
      }
    }

    // Attach sorted fields
    attachFields.sort((a, b) => {
      if (a.priority > b.priority) return -1;
      if (a.priority < b.priority) return 1;
      if (a.field.type?.name === NS_SYSTEM_LOCALE_STRING)
      {
        if (a.field.name === 'display')
          return -1;
        if (b.field.name === 'display')
          return 1;
      }
      return a.field.name.localeCompare(b.field.name);
    });
    if (attachFields.length)
      logger.debug("[Struct]", this.name, "[Attach]", attachFields.map(f => f.field.name));
    for (const field of attachFields)
      this._fields.push(field.field);

    // Load relations from Relations property
    const relations = getProperty(this._structSchema, Relations)?.getValue<RelationSchema[]>();
    if (relations?.length)
    {
      const rtypes: IRelation[] = [];
      for (const r of relations)
      {
        const rtype = new RelationType(r, this);
        rtypes.push(rtype);
        await rtype.load();
      }
      this._relations = rtypes;
    }

    // Attach relations from attach properties
    const rtypes: RelationType[] = [];
    for (const r of attachRelations)
    {
      const rtype = new RelationType(r, this);
      rtypes.push(rtype);
      await rtype.load();
    }
    this._relations = this._relations ? [...this._relations, ...rtypes] : rtypes;
  }

  override unload(): void {
    this._fields = [];
    this._relations = undefined;
  }

  // ── Field Access ────────────────────────────────────────────────────

  /** Get all field type definitions. */
  *getFields(): Generator<StructFieldType> { yield* this._fields; }

  /** Get a field by name (case-insensitive). */
  getField(name: string): StructFieldType | undefined {
    return this._fields.find(f => f.name.toLowerCase() === name.toLowerCase());
  }

  /** Get index of a field by name. */
  getFieldIndex(fieldName: string): number {
    return this._fields.findIndex(f => f.name.toLowerCase() === fieldName.toLowerCase());
  }

  // ── Path Navigation ─────────────────────────────────────────────────

  override getAccessValueType(path: string): ValueType | undefined {
    if (isEmpty(path) || path === NODE_SELF) return this;

    const dotIdx = path.indexOf('.');
    const first = dotIdx >= 0 ? path.substring(0, dotIdx) : path;
    const remain = dotIdx >= 0 ? path.substring(dotIdx + 1) : '';

    for (const field of this._fields) {
      if (first.toLowerCase() === field.name.toLowerCase()) {
        return remain ? field.type?.getAccessValueType(remain) : field.type;
      }
    }
    return undefined;
  }

  override getAccessEntries(): Entry<string>[] {
    return this._fields
      .filter(f => f.type != null && this._structSchema?.fields.some(sf => f.name == sf.name)) // no property field
      .map(f => {
        const entry = { value: f.name, hasChildren: f.type?.hasAccessEntries } as Entry<string>;
        return setPropertyValue(entry, Display, f.getPropertyValue(Display) ?? _LS(f.name));
      });
  }

  override get hasAccessEntries(): boolean { return !!this._structSchema?.fields.length; }

  // ── Property ────────────────────────────────────────────────────────

  override getProperty<T extends IProperty>(propCtor: PropertyCtor | string): T | undefined {
    // enable prototype properties
    return super.getProperty<T>(propCtor) ?? getSchemaKindProperty<T>(this.kind, propCtor);
  }

  override *getProperties<T extends IProperty>(propCtor: PropertyCtor | string): Generator<T> {
    for (let prop of joinProperties(super.getProperties<T>(propCtor), getSchemaKindProperties<T>(this.kind, propCtor))) yield prop as T;
  }

  override *filterProperties(predicate: (prop: IProperty) => boolean): Generator<IProperty> {
    for (let prop of joinProperties(super.filterProperties(predicate), filterSchemaKindProperties(this.kind, predicate))) yield prop;
  }

  // ── References ──────────────────────────────────────────────────────

  override *getRefTypes(): Generator<INodeType> {
    for (const field of this._fields) {
      yield* field.getRefTypes();
    }
    yield* super.getRefTypes();
  }

  // ── Type Compatibility ──────────────────────────────────────────────

  override isAssignableTo(other: ValueType): boolean {
    if (super.isAssignableTo(other)) return true;
    if (!(other instanceof StructType)) return false;

    // At least one common field, and all other fields are assignable
    const otherFields = other.getFields();
    const hasCommon = otherFields.some(v =>
      this._fields.some(f => f.name.toLowerCase() === v.name.toLowerCase()),
    );
    if (!hasCommon) return false;

    let matched = 0;
    return otherFields.every(v => {
      const match = this._fields.find(
        f => f.name.toLowerCase() === v.name.toLowerCase(),
      );
      if (!match?.type) return !v.require;
      if (v.type != null && match.type.isAssignableTo(v.type))
      {
        matched++;
        return true;
      }
      return false;
    }) && matched > 0;
  }

  // ── Relations ───────────────────────────────────────────────────────

  /** Get all relation types. */
  *getRelations(): Generator<IRelation> {
    if (!this._relations?.length) return;
    yield* this._relations;
  }

  /** Get relations for a specific field name. */
  *getRelationsForField(fieldName: string): Generator<IRelation> {
    if (!this._relations?.length) return;
    for(const relation of this._relations)
      if (relation.target?.toLowerCase() === fieldName.toLowerCase() || relation.target?.toLowerCase().startsWith(fieldName.toLowerCase() + '.'))
        yield relation;
  }
}

/** Struct field type. */
export class StructFieldType implements INodeReference, IPropertyProvider {
  private _fieldSchema?: StructFieldSchema;
  private _props?: IProperty[];
  private _refTypes?: INodeType[];
  private _displayOnly?: boolean;
  private _require?: boolean;
  private _type?: ValueType;
  private _unpack?: boolean;
  private _overrideMap?: Map<ValueType, StructFieldType>;

  /** The field name. */
  get name() { return this._fieldSchema?.name ?? '' };

  /** The resolved value type. */
  get type() { return this._type };

  /** Get all constraints. */
  get constraints(): IConstraintProperty[] { 
    const constraints = Array.from(this.filterProperties(isConstraintProperty)) as unknown as IConstraintProperty[];
    constraints.reverse();
    return constraints;
  };

  /** Whether the field is require by default */
  get require() { return this._require ?? false } 

  /** Whether the field is display-only. */
  get displayOnly() { return this._displayOnly ?? false };

  /** The field is used to pack & unpack the data */
  get unpack() { return this._unpack ?? false };

  /** Error status. */
  get error() { return this._fieldSchema?.error }

  // ── Loading ─────────────────────────────────────────────────────────

  /**
   * Load field from StructFieldSchema. Resolves the type name via getNodeType,
   * collects properties and constraints.
   */
  async load(
    field: StructFieldSchema,
    generics?: GenericParameter[],
    genericParams?: INodeType[],
  ): Promise<void> {
    this._fieldSchema = field;

    // Resolve the field's value type
    this._type = await getNodeType(field.type, generics, genericParams) as ValueType | undefined;
    if (!this.type) return;

    // Collect properties from schema kind registries
    const props = Array.from(getPropertiesBySchemaKind(field, SCHEMA_KIND_STRUCT_FIELD));
    props.push(...getPropertiesBySchemaKind(field, this.type.kind));
    if (this.type instanceof ArrayType && this.type.element)
      props.push(...getPropertiesBySchemaKind(field, this.type.element.kind));

    this._props = props;

    const refTypes: INodeType[] = []
    for(let prop of props.filter(isTypeRefProperty))
    {
      for(let n of (prop as unknown as ITypeRefProperty).getRefTypes())
      {
        const type = await getNodeType(n);
        if (type && !refTypes.includes(type))
          refTypes.push(type);
      }
    }
    this._refTypes = refTypes;

    // property
    const name = new Name();
    name.setValue(field.name);
    this._props.unshift(name); // special property
    this._require = this.getProperty(Require)?.getValue<boolean>();
    this._displayOnly = this.getProperty(DisplayOnly)?.getValue<boolean>() ?? false;
    this._unpack = this.getProperty(Unpack)?.getValue<boolean>();
  }

  // ── Reference Types ─────────────────────────────────────────────────

  *getRefTypes(): Generator<INodeType> {
    if (this.type) 
      yield this.type;
    if (this._refTypes)
      yield* this._refTypes;
  }

  // ── Property Access ─────────────────────────────────────────────────

  /** Get property by type */
  getProperty<T extends IProperty>(propCtor: PropertyCtor | string): T | undefined {
    return this._props?.find(p => typeof propCtor === 'string' ? p.name.toLowerCase() === propCtor.toLowerCase() : p instanceof propCtor) as T ?? this._type?.getProperty(propCtor);
  }

  /** Gets the property value */
  getPropertyValue<T>(propCtor: PropertyCtor | string): T | undefined { return this.getProperty(propCtor)?.getValue() as T; }

  /** Get properties by type */
  *getProperties<T extends IProperty>(propCtor: PropertyCtor | string): Generator<T> {
    for (let prop of joinProperties(this._props?.filter(p => typeof propCtor === 'string' ? p.name.toLowerCase() === propCtor.toLowerCase() : p instanceof propCtor) as T[], this._type?.getProperties(propCtor))) yield prop as T;
  }

  /** Gets the property values */
  *getPropertyValues<T>(propCtor: PropertyCtor | string): Generator<T> { for (let prop of this.getProperties(propCtor)) yield prop.getValue() as T; }

  /** Filter properties by predicate */
  *filterProperties(predicate: (prop: IProperty) => boolean): Generator<IProperty> {
    for (let prop of joinProperties(this._props?.filter(predicate), this._type?.filterProperties(predicate))) yield prop;
  }

  // ── Override Field Type ─────────────────────────────────────────────────

  getOverrideFieldType(type?: ValueType): StructFieldType { 
    if (!type) return this;
    if (this._overrideMap?.has(type)) return this._overrideMap.get(type)!;
    const overrideField = new StructFieldType();
    overrideField._props = this._props;
    overrideField._fieldSchema = this._fieldSchema;
    overrideField._type = type;
    this._overrideMap ??= new Map();
    this._overrideMap.set(type, overrideField);
    return overrideField;
  }
}