// =============================================================================
// ScalarType — abstract base for scalar runtime types
// Mirrors C# SchemaNode.Core/Runtime/Type/ScalarType.cs
// =============================================================================

import { ValueType } from '../valueType';
import type { NodeSchema } from '../../../schema/nodeSchema';

export abstract class ScalarType extends ValueType {
  /** Base type for scalar inheritance. */
  baseNode?: ScalarType;

  constructor(schema: NodeSchema, genericParams?: ValueType[]) {
    super(schema, genericParams);
  }

  override isAssignableTo(other: ValueType): boolean {
    if (super.isAssignableTo(other)) return true;
    if (this.baseNode?.isAssignableTo(other)) return true;
    return this.kind === other.kind;
  }

  /** Property lookup falls through to base. */
  override getProperty<T>(propName: string): T | undefined {
    const self = super.getProperty<T>(propName);
    if (self !== undefined) return self;
    return this.baseNode?.getProperty<T>(propName);
  }
}
