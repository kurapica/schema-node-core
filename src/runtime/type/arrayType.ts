// =============================================================================
// ArrayType — runtime type for array schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/ArrayType.cs
// =============================================================================

import { ValueType } from './valueType';
import { ArrayNode } from '../../node/arrayNode';
import { ArrayProperty, ArraySchema } from '../../schema/arraySchema';
import { getPropertiesBySchemaKind, getProperty } from '../../property/propertyOwner';
import { RelationType } from './relationType';
import { IProperty, Primary } from '../../property';
import { ARRAY_ELEMENT, ARRAY_PREVIOUS, NODE_SELF, SCHEMA_KIND_ARRAY } from '../../utility/constant';
import { filterSchemaKindProperties, getNodeType, getSchemaKindProperties, getSchemaKindProperty } from '../schemaRuntime';
import { NodeType } from './nodeType';
import { isEmpty } from '../../utility/toolset';
import { Entry } from '../../struct/entry';
import { IPropertyProvider, IRelationProvider, IValueAccess, joinProperties } from '../interfaces';
import { Relations, RelationSchema } from '../../schema/relationSchema';
import { EnumType } from './enumType';
import { EnumArrayNode } from '../../node/enumArrayNode';
import { DataNode } from '../../node/dataNode';

export class ArrayType extends ValueType implements IRelationProvider {
  private _arraySchema: ArraySchema | undefined;

  /** Element value type (resolved at load time). */
  element?: ValueType;

  /** Primary key field names. */
  primary: string[] = [];

  /** The relation types */
  private _relations?: RelationType[];

  override async load() {
    this.element = this._arraySchema?.element
      ? await getNodeType(this._arraySchema.element) as ValueType
      : undefined;
    this.primary = this.getProperty(Primary)?.getValue<string[]>() ?? [];

    // Load relations from Relations property
    const relations = getProperty(this._arraySchema, Relations)?.getValue<RelationSchema[]>();
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

  override loadProperties(): IProperty[]{
    this._arraySchema = getProperty(this.schema, ArrayProperty)?.getValue();
    return this._arraySchema ? Array.from(getPropertiesBySchemaKind(this._arraySchema, SCHEMA_KIND_ARRAY)) : [];
  }

  override unload(): void {
    this._relations = undefined;
  }

  override create(value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider): DataNode {
    if (this.element instanceof EnumType)
      return new EnumArrayNode(this, value, parent, propProvider);
    return new ArrayNode(this, value, parent, propProvider);
  }

  override *getRefTypes(): Generator<NodeType> {
    if (this.element)
      yield this.element;
    yield* super.getRefTypes();
  }

  override getAccessValueType(path: string): ValueType | undefined {
    if (isEmpty(path) || path === NODE_SELF || path === ARRAY_PREVIOUS) return this;
    return path === ARRAY_ELEMENT ? this.element : this.element?.getAccessValueType(path);
  }

  override getSubEntries(): Entry<string>[] {
    return [
      {
        value: ARRAY_PREVIOUS
      } as Entry<string>, 
      {
        value: ARRAY_ELEMENT
      } as Entry<string>
    ]
    .concat(this.element?.getSubEntries() ?? []);
  }

  override get hasSubEntries(): boolean {
    return this.element?.hasSubEntries ?? false;
  }

  override getProperty<T extends IProperty>(propCtor: new () => T): T | undefined {
    return super.getProperty(propCtor) ?? this.element?.getProperty(propCtor) ?? getSchemaKindProperty<T>(this.kind, propCtor);
  }

  override *getProperties<T extends IProperty>(propCtor: new () => T): Generator<T> {
    return joinProperties(super.getProperties(propCtor), this.element?.getProperties(propCtor), getSchemaKindProperties(this.kind, propCtor));
  }

  override *filterProperties(predicate: (prop: IProperty) => boolean): Generator<IProperty> {
    return joinProperties(super.filterProperties(predicate), this.element?.filterProperties(predicate), filterSchemaKindProperties(this.kind, predicate));
  }

  *getRelations(): Generator<RelationType> {
    if (!this._relations?.length) return;
    yield* this._relations;
  }
}
