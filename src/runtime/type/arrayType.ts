// =============================================================================
// ArrayType — runtime type for array schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/ArrayType.cs
// =============================================================================

import { ValueType } from './valueType';
import { ArrayNode } from '../../node/arrayNode';
import type { NodeSchema } from '../../schema/nodeSchema';
import { ArrayProperty } from '../../schema/arraySchema';
import { getProperty } from '../../property/propertyOwner';

export class ArrayType extends ValueType {
  /** Element value type (resolved at load time). */
  element?: ValueType;

  /** Primary key field names. */
  primaryKeys: string[] = [];

  override async loadType(schema: NodeSchema, genericParams?: import('./nodeType').NodeType[]): Promise<void> {
    await super.loadType(schema, genericParams);

    const arrayProp = getProperty(schema, ArrayProperty);
    const arrayData = arrayProp?.getValue<{ element?: string }>();
    if (arrayData?.element && genericParams?.[0]) {
      this.element = genericParams[0] as ValueType;
    }
  }

  override create(): ArrayNode {
    return new ArrayNode(this);
  }
}
