// =============================================================================
// ArrayType — runtime type for array schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/ArrayType.cs
// =============================================================================

import { ValueType } from './valueType';
import { ArrayNode } from '../../node/arrayNode';
import { ArrayProperty } from '../../schema/arraySchema';
import { getPropertiesBySchemaKind, getProperty } from '../../property/propertyOwner';
import { RelationType } from './relationType';
import { IProperty } from '../../property';
import { SCHEMA_KIND_ARRAY } from '../../utility/constant';

export class ArrayType extends ValueType {
  /** Element value type (resolved at load time). */
  element?: ValueType;

  /** Primary key field names. */
  primaryKeys: string[] = [];

  /** The relation types */
  relations?: RelationType[];

  async load() {
    
  }

  loadProperties(): IProperty[]{
    const arraySchema = getProperty(this.schema!, ArrayProperty);
    return arraySchema ? getPropertiesBySchemaKind(arraySchema, SCHEMA_KIND_ARRAY) : [];
  }

  override create(): ArrayNode {
    return new ArrayNode(this);
  }
}
