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
import { getNodeType } from '../schemaRuntime';
import { NodeType } from './nodeType';
import { isEmpty } from '../../utility/toolset';
import { Entry } from '../../struct/entry';

export class ArrayType extends ValueType {
  private _arraySchema: ArraySchema | undefined;

  /** Element value type (resolved at load time). */
  element?: ValueType;

  /** Primary key field names. */
  primary: string[] = [];

  /** The relation types */
  relations?: RelationType[];

  override async load() {
    this.element = this._arraySchema?.element
      ? await getNodeType(this._arraySchema.element) as ValueType
      : undefined;
    this.primary = this.getProperty(Primary)?.getValue<string[]>() ?? [];
  }

  override loadProperties(): IProperty[]{
    this._arraySchema = getProperty(this.schema, ArrayProperty)?.getValue();
    return this._arraySchema ? getPropertiesBySchemaKind(this._arraySchema, SCHEMA_KIND_ARRAY) : [];
  }

  override unload(): void {
    this.relations = undefined;
  }

  override create(): ArrayNode {
    return new ArrayNode(this);
  }

  override getRefTypes(): NodeType[] {
    return this.element ? [this.element as NodeType].concat(super.getRefTypes()) : super.getRefTypes();
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
    return super.getProperty(propCtor) ?? this.element?.getProperty(propCtor);
  }

  override *getProperties<T extends IProperty>(propCtor: new () => T): Generator<T> {
    for(let p of super.getProperties(propCtor))
    {
      yield p;
      if (!p.stackable) return;
    }
    if (this.element)
    {
      for (let p of this.element.getProperties(propCtor))
      {
        yield p;
        if (!p.stackable) return;
      }
    }
  }
}
