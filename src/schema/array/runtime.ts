// =============================================================================
// ArrayType — runtime type for array schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/ArrayType.cs
// =============================================================================

import { getPropertiesBySchemaKind, getProperty, getPropertyValue } from '../../property/propertyOwner';
import { isEmpty } from '../../utility/toolset';
import { ValueType } from '../value/runtime';
import { filterSchemaKindProperties, getSchemaKindProperties, getSchemaKindProperty } from '../../runtime/schemaRuntime';
import { Relations } from '../relation/property';
import { RelationType } from '../relation/runtime';
import { joinProperties } from '../../interface';
import { DataNode } from '../value/node';
import { EnumType } from '../enum/runtime';
import { getNodeType } from '../../runtime/context';
import { EnumValueType } from '../../enum/enumValueType/type';

import type { IProperty, PropertyCtor, IRelationProvider, IValueAccess, IPropertyProvider, INodeType, IRelation } from '../../interface';
import type { Entry } from '../../struct/entry/type';
import type { ArraySchema } from './type';
import type { RelationSchema } from '../relation/type';

import { ARRAY_ELEMENT, ARRAY_PREVIOUS, NODE_SELF, SCHEMA_KIND_ARRAY } from '../../utility/constant';

export class ArrayType extends ValueType implements IRelationProvider {
  private _arraySchema: ArraySchema | undefined;

  /** Element value type (resolved at load time). */
  element?: ValueType;

  /** Primary key field names. */
  primary: string[] = [];

  /** The relation types */
  private _relations?: IRelation[];

  override async load() {
    this.element = this._arraySchema?.element
      ? await getNodeType(this._arraySchema.element, this.generics, this.genericParams) as ValueType
      : undefined;
    this.primary = this.getProperty("Primary")?.getValue<string[]>() ?? [];

    this.element?.setArrayType(this);

    // Load relations from Relations property
    const relations = getProperty(this._arraySchema, Relations)?.getValue<RelationSchema[]>();
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
  }

  override loadProperties(): IProperty[]{
    this._arraySchema = getPropertyValue<ArraySchema>(this.schema, "array");
    return this._arraySchema ? Array.from(getPropertiesBySchemaKind(this._arraySchema, SCHEMA_KIND_ARRAY)) : [];
  }

  override unload(): void {
    this.element?.removeArrayType(this);
    this._relations = undefined;
  }

  override create(value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider): IValueAccess {
    // enum array node
    if (this.element instanceof EnumType)
      return new EnumArrayNode(this, value, parent, propProvider);

    // default array node
    return super.create(value, parent, propProvider);
  }

  override *getRefTypes(): Generator<INodeType> {
    if (this.element)
      yield this.element;
    yield* super.getRefTypes();
  }

  override getAccessValueType(path: string): ValueType | undefined {
    if (isEmpty(path) || path === NODE_SELF || path === ARRAY_PREVIOUS) return this;
    return path === ARRAY_ELEMENT ? this.element : this.element?.getAccessValueType(path);
  }

  override getAccessEntries(): Entry<string>[] {
    return [
      {
        value: ARRAY_PREVIOUS
      } as Entry<string>, 
      {
        value: ARRAY_ELEMENT
      } as Entry<string>
    ]
    .concat(this.element?.getAccessEntries() ?? []);
  }

  override get hasAccessEntries(): boolean { return true; }

  override getProperty<T extends IProperty>(propCtor: PropertyCtor | string): T | undefined {
    return super.getProperty(propCtor) ?? this.element?.getProperty(propCtor) ?? getSchemaKindProperty<T>(this.kind, propCtor);
  }

  override *getProperties<T extends IProperty>(propCtor: PropertyCtor | string): Generator<T> {
    for (let prop of joinProperties(super.getProperties(propCtor), this.element?.getProperties(propCtor), getSchemaKindProperties(this.kind, propCtor))) yield prop as T;
  }

  override *filterProperties(predicate: (prop: IProperty) => boolean): Generator<IProperty> {
    for (let prop of joinProperties(super.filterProperties(predicate), this.element?.filterProperties(predicate), filterSchemaKindProperties(this.kind, predicate))) yield prop;
  }

  *getRelations(): Generator<IRelation> {
    if (!this._relations?.length) return;
    yield* this._relations;
  }
}

/** Enum array node */
export class EnumArrayNode extends DataNode {
  readonly enumType: EnumType;

  constructor(type: ArrayType, value?: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
      super(type, value, parent, propProvider);
      this.enumType = type.element as EnumType;
  }

  override getValue(): unknown[] {
    const value = this.rawValue as unknown[];
    if (!Array.isArray(value)) return [];
    return value.map((item) => this.enumType.type === EnumValueType.String ? `${item}` : parseInt(`${item}`));
  }

  get length() {
    return (this.rawValue as unknown[]).length;
  }
}