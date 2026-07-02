// =============================================================================
// ArrayType — runtime type for array schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/ArrayType.cs
// =============================================================================

import { ValueType } from './valueType';
import { ArrayNode } from '../../node/arrayNode';
import type { NodeSchema } from '../../schema/nodeSchema';

export class ArrayType extends ValueType {
  /** Element value type (resolved at load time). */
  elementType?: ValueType;

  /** Primary key field names. */
  primaryKeys: string[] = [];

  constructor(schema: NodeSchema, genericParams?: ValueType[]) {
    super(schema, genericParams);
  }

  override load(): void {
    const arrayData = this.schema.extensions?.['array'] as ArraySchemaData | undefined;
    this.primaryKeys = arrayData?.primary ?? [];
    super.load();
  }

  override create(): ArrayNode {
    return new ArrayNode(this.schema);
  }

  override getAccessValueType(path: string): ValueType | undefined {
    if (path === '$self') return this;
    if (path === '$element' || path === '$previous') return this.elementType;
    if (this.elementType) return this.elementType.getAccessValueType(path);
    return undefined;
  }
}

interface ArraySchemaData {
  element?: string;
  primary?: string[];
}
