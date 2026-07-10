// =============================================================================
// ScalarType — abstract base for scalar runtime types
// Mirrors C# SchemaNode.Core/Runtime/Type/ScalarType.cs
// =============================================================================

import { ValueType } from '../valueType';
import type { NodeSchema } from '../../../schema/nodeSchema';

export abstract class ScalarType extends ValueType {
  /** Base type for scalar inheritance. */
  baseNode?: ScalarType;

  override isCompatibleWith(other: ValueType): boolean {
    if (super.isCompatibleWith(other)) return true;
    if (this.baseNode?.isCompatibleWith(other)) return true;
    return this.kind === other.kind;
  }
}
