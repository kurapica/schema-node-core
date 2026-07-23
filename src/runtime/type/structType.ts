// =============================================================================
// StructType — runtime type for struct schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/StructType.cs
// =============================================================================

import { ValueType } from './valueType';
import { StructNode } from '../../node/structNode';
import { StructProperty, StructSchema, type StructFieldSchema } from '../../schema/structSchema';
import { getPropertiesBySchemaKind, getProperty } from '../../property/propertyOwner';
import { IRelationProvider, joinProperties, type INodeReference, type IPropertyProvider, type IValueAccess } from '../interfaces';
import { isTypeRefProperty, type IProperty, type ITypeRefProperty } from '../../property/property';
import { IConstraintProperty, isConstraintProperty } from '../../property/constraintProperty';
import { NodeType } from './nodeType';
import { filterSchemaKindProperties, getNodeType, getSchemaKindProperties, getSchemaKindProperty } from '../schemaRuntime';
import { SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_STRUCT, NODE_SELF } from '../../utility/constant';
import { isEmpty } from '../../utility/toolset';
import type { Entry } from '../../struct/entry';
import { RelationType } from './relationType';
import { ArrayType } from './arrayType';
import { DisplayOnly, Require, Unpack } from '../../property';
import { Name } from '../../property/core/name';
import { Relations, RelationSchema } from '../../schema/relationSchema';

// ── StructType ────────────────────────────────────────────────────────────

/** The runtime struct type */
export class StructType extends ValueType implements IRelationProvider {
  /** Field type definitions. */
  private _fields: StructFieldType[] = [];

  /** Relation types (loaded from Relations property). */
  private _relations: RelationType[] | undefined;

  /** The struct schema data. */
  private _structSchema: StructSchema | undefined;

  // ── Loading ─────────────────────────────────────────────────────────

  override loadProperties(): IProperty[] {
    this._structSchema = getProperty(this.getNodeSchema(), StructProperty)?.getValue();
    return this._structSchema ? getPropertiesBySchemaKind(this._structSchema, SCHEMA_KIND_STRUCT).toArray() : [];
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

    // Load relations from Relations property
    const relations = getProperty(this._structSchema, Relations)?.getValue<RelationSchema[]>();
    if (relations?.length)
    {
      const rtypes: RelationType[] = [];
      for (const r of relations)
      {
        const rtype = new RelationType(r, this);
        rtypes.push(rtype);
        await rtype.load();
      }
      this._relations = rtypes;
    }
  }

  override unload(): void {
    this._fields = [];
    this._relations = undefined;
  }

  // ── Field Access ────────────────────────────────────────────────────

  /** Get all field type definitions. */
  getFields(): StructFieldType[] { return this._fields; }

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

  // ── Sub Entries ─────────────────────────────────────────────────────

  override getSubEntries(): Entry<string>[] {
    return this._fields
      .filter(f => f.type != null && !f.displayOnly)
      .map(f => ({ value: f.name } as Entry<string>));
  }

  override get hasSubEntries(): boolean {
    return this._fields.length > 0;
  }

  // ── Property ────────────────────────────────────────────────────────

  override getProperty<T extends IProperty>(propCtor: new () => T): T | undefined {
    // enable prototype properties
    return super.getProperty<T>(propCtor) ?? getSchemaKindProperty<T>(this.kind, propCtor);
  }

  override *getProperties<T extends IProperty>(propCtor: new () => T): Generator<T> {
    return joinProperties(super.getProperties<T>(propCtor), getSchemaKindProperties<T>(this.kind, propCtor));
  }

  override filterProperties(predicate: (prop: IProperty) => boolean): Generator<IProperty> {
    return joinProperties(super.filterProperties(predicate), filterSchemaKindProperties(this.kind, predicate));
  }

  // ── References ──────────────────────────────────────────────────────

  override *getRefTypes(): Generator<NodeType> {
    for (const field of this._fields) {
      for (const type of field.getRefTypes())
        yield type;
    }
    for (const type of super.getRefTypes())
      yield type;
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

  // ── DataNode Factory ────────────────────────────────────────────────

  override create(value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider): StructNode {
    return new StructNode(this, value, parent, propProvider);
  }

  // ── Relations ───────────────────────────────────────────────────────

  /** Get all relation types. */
  *getRelations(): Generator<RelationType> {
    if (!this._relations?.length) return;
    for(const relation of this._relations)
      yield relation;
  }

  /** Get relations for a specific field name. */
  *getRelationsForField(fieldName: string): Generator<RelationType> {
    if (!this._relations?.length) return;
    for(const relation of this._relations)
      if (relation.target?.toLowerCase() === fieldName.toLowerCase() || relation.target?.toLowerCase().startsWith(fieldName.toLowerCase() + '.'))
        yield relation;
  }
}

// ── StructFieldType ────────────────────────────────────────────────────────

export class StructFieldType implements INodeReference, IPropertyProvider {
  private _fieldSchema?: StructFieldSchema;
  private _props?: IProperty[];
  private _refTypes?: NodeType[];
  private _displayOnly?: boolean;
  private _require?: boolean;
  private _type?: ValueType;
  private _unpack?: boolean;

  /** The field name. */
  get name() { return this._fieldSchema?.name ?? '' };

  /** The resolved value type. */
  get type() { return this._type };

  /** Get all constraints. */
  get constraints(): IConstraintProperty[] { 
    const constraints = this.filterProperties(isConstraintProperty).toArray() as IConstraintProperty[];
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
    generics?: import('../../property/core/generics').GenericParameter[],
    genericParams?: NodeType[],
  ): Promise<void> {
    this._fieldSchema = field;

    // Resolve the field's value type
    this._type = await getNodeType(field.type, generics, genericParams) as ValueType | undefined;
    if (!this.type) return;

    // Collect properties from schema kind registries
    const props = getPropertiesBySchemaKind(field, SCHEMA_KIND_STRUCT_FIELD).toArray();
    props.push(...getPropertiesBySchemaKind(field, this.type.kind));
    if (this.type instanceof ArrayType && this.type.element)
      props.push(...getPropertiesBySchemaKind(field, this.type.element.kind));

    this._props = props;

    const refTypes: NodeType[] = []
    for(let prop of props.filter(isTypeRefProperty))
    {
      for(let n of (prop as ITypeRefProperty).getRefTypes())
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

  *getRefTypes(): Generator<NodeType> {
    if (this.type) 
      yield this.type;
    if (this._refTypes)
    {
      for (const type of this._refTypes)
        yield type;
    }
  }

  // ── Property Access ─────────────────────────────────────────────────

  /** Get property by type */
  getProperty<T extends IProperty>(propCtor: new () => T): T | undefined {
    return this._props?.find(p => p instanceof propCtor) as T ?? this._type?.getProperty(propCtor);
  }

  /** Get properties by type */
  *getProperties<T extends IProperty>(propCtor: new () => T): Generator<T> {
    return joinProperties(this._props?.filter(p => p instanceof propCtor) as T[], this._type?.getProperties(propCtor));
  }

  /** Filter properties by predicate */
  *filterProperties(predicate: (prop: IProperty) => boolean): Generator<IProperty> {
    return joinProperties(this._props?.filter(predicate), this._type?.filterProperties(predicate));
  }
}