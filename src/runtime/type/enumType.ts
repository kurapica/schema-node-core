// =============================================================================
// EnumType — runtime type for enum schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/EnumType.cs
// =============================================================================

import { ValueType } from './valueType';
import { EnumNode } from '../../node/enumNode';
import type { NodeSchema } from '../../schema/nodeSchema';
import type { EnumValueInfo } from '../../schema/enumSchema';
import type { EnumValueTypeValue } from '../../enum/enumValueType';

export class EnumType extends ValueType {
  /** Storage type. */
  enumValueType: EnumValueTypeValue = 'string';

  /** Enum value tree. */
  values: EnumValueInfo[] = [];

  constructor(schema: NodeSchema, genericParams?: ValueType[]) {
    super(schema, genericParams);
  }

  override load(): void {
    const enumData = this.schema.extensions?.['enum'] as EnumSchemaData | undefined;
    this.enumValueType = enumData?.type ?? 'string';
    this.values = enumData?.values ?? [];
    super.load();
  }

  override create(): EnumNode {
    const node = new EnumNode(this.schema);
    node.valueType = this.enumValueType;
    return node;
  }
}

interface EnumSchemaData {
  type?: EnumValueTypeValue;
  values?: EnumValueInfo[];
}
