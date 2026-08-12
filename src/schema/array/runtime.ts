// =============================================================================
// ArrayType — runtime type for array schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/ArrayType.cs
// =============================================================================

import { getPropertiesBySchemaKind, getProperty, getPropertyValue } from '../../property/propertyOwner';
import { DataNodeType } from '../../property/core/dataNodeType';
import type { IProperty, PropertyCtor } from '../../interface/valueAccess';
import { Name } from '../../property/core/name';
import { Primary } from '../../property/constraint/primary';
import { ARRAY_ELEMENT, ARRAY_PREVIOUS, NODE_SELF, SCHEMA_KIND_ARRAY } from '../../utility/constant';
import { isEmpty } from '../../utility/toolset';
import type { Entry } from '../../struct/entry/type';
import { getMetaProperty } from '../../attribute/meta';
import { ValueType } from '../value/runtime';
import type { IRelationProvider } from '../../interface/relationProvider';
import type { ArraySchema } from './type';
import { filterSchemaKindProperties, getSchemaKindProperties, getSchemaKindProperty, getSchemaType } from '../../runtime/schemaRuntime';
import { Relations } from '../relation/property';
import type { RelationSchema } from '../relation/type';
import { RelationType } from '../relation';
import type { IRelation, IValueAccess } from '../../interface/valueAccess';
import type { IPropertyProvider } from '../../interface/propertyProvider';
import { joinProperties } from '../../interface/propertyProvider';
import { DataNode } from '../value/node';
import { EnumType } from '../enum/runtime';
import { EnumArrayNode } from '../enum/array';
import { ArrayNode } from './node';
import { getNodeType } from '../../runtime/context';
import type { INodeType } from '../../interface/nodeType';

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
      ? await getNodeType(this._arraySchema.element) as ValueType
      : undefined;
    this.primary = this.getProperty(Primary)?.getValue<string[]>() ?? [];

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

  override create(value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider): DataNode {
    // Check data node type
    if (parent instanceof DataNode && propProvider?.getProperty(Name)?.hasValue) {
      const schemaType = getSchemaType(parent.type.name);
      const dataNodeType = schemaType ? getMetaProperty(schemaType, DataNodeType, propProvider.getProperty(Name)!.getValue<string>())?.getValue<new (type: ValueType, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) => DataNode>() : undefined;
      if (dataNodeType)
        return new dataNodeType(this, value, parent, propProvider);
    }

    // enum array node
    if (this.element instanceof EnumType)
      return new EnumArrayNode(this, value, parent, propProvider);

    // default array node
    return new ArrayNode(this, value, parent, propProvider);
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
    return joinProperties(super.getProperties(propCtor), this.element?.getProperties(propCtor), getSchemaKindProperties(this.kind, propCtor));
  }

  override *filterProperties(predicate: (prop: IProperty) => boolean): Generator<IProperty> {
    return joinProperties(super.filterProperties(predicate), this.element?.filterProperties(predicate), filterSchemaKindProperties(this.kind, predicate));
  }

  *getRelations(): Generator<IRelation> {
    if (!this._relations?.length) return;
    yield* this._relations;
  }
}
