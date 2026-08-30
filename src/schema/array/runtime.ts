// =============================================================================
// ArrayType — runtime type for array schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/ArrayType.cs
// =============================================================================

import { getPropertiesBySchemaKind, getProperty, getPropertyValue, setPropertyValue } from '../../property/propertyOwner';
import { isEmpty } from '../../utility/toolset';
import { ValueType } from '../value/runtime';
import { filterSchemaKindProperties, getSchemaKindProperties, getSchemaKindProperty } from '../../runtime/schemaRuntime';
import { Relations } from '../relation/property';
import { RelationType } from '../relation/runtime';
import { joinProperties } from '../../interface';
import { getNodeType } from '../../runtime/context';

import type { IProperty, PropertyCtor, IRelationProvider, INodeType, IRelation, IArrayValueTypeAccess } from '../../interface';
import type { Entry } from '../../struct/entry/type';
import type { ArraySchema } from './type';
import type { RelationSchema } from '../relation/type';

import { ARRAY_ELEMENT, ARRAY_PREVIOUS, NODE_SELF, SCHEMA_KIND_ARRAY } from '../../utility/constant';
import { Display } from '../../property/common/display';
import { _LS } from '../../utility';

export class ArrayType extends ValueType implements IRelationProvider, IArrayValueTypeAccess {
  private _arraySchema: ArraySchema | undefined;

  /** Element value type (resolved at load time). */
  private _element?: ValueType;
  get element(): ValueType | undefined { return this._element; }

  /** Primary key field names. */
  primary: string[] = [];

  /** The relation types */
  private _relations?: IRelation[];

  override async load() {
    this._element = this._arraySchema?.element
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

  override *getRefTypes(): Generator<INodeType> {
    if (this.element)
      yield this.element;
    yield* super.getRefTypes();
  }

  override getAccessValueType(path: string): ValueType | undefined {
    if (isEmpty(path) || path === NODE_SELF || path === ARRAY_PREVIOUS) return this;

    const dotIdx = path.indexOf('.');
    const first = dotIdx >= 0 ? path.substring(0, dotIdx) : path;
    const remain = dotIdx >= 0 ? path.substring(dotIdx + 1) : '';
    if (first !== ARRAY_ELEMENT) return undefined;
    return remain ? this.element?.getAccessValueType(remain) : this.element;
  }

  override getAccessEntries(): Entry<string>[] {
    return [
      setPropertyValue({
        value: ARRAY_PREVIOUS,
      } as Entry<string>, Display, _LS("ARRAY_PREVIOUS")),
      setPropertyValue({
        value: ARRAY_ELEMENT,
        hasChildren: this.element?.hasAccessEntries
      } as Entry<string>, Display, _LS("ARRAY_ELEMENT"))
    ]
  }

  override get hasAccessEntries(): boolean { return true; }

  override getProperty<T extends IProperty>(propCtor: PropertyCtor | string): T | undefined {
    return super.getProperty(propCtor) ?? getSchemaKindProperty<T>(this.kind, propCtor);
  }

  override *getProperties<T extends IProperty>(propCtor: PropertyCtor | string): Generator<T> {
    for (let prop of joinProperties(super.getProperties(propCtor), getSchemaKindProperties(this.kind, propCtor))) yield prop as T;
  }

  override *filterProperties(predicate: (prop: IProperty) => boolean): Generator<IProperty> {
    for (let prop of joinProperties(super.filterProperties(predicate), filterSchemaKindProperties(this.kind, predicate))) yield prop;
  }

  *getRelations(): Generator<IRelation> {
    if (!this._relations?.length) return;
    yield* this._relations;
  }
}
