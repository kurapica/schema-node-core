// =============================================================================
// ValueType — abstract base for value-bearing runtime types
// Mirrors C# SchemaNode.Core/Runtime/Type/ValueType (in NodeType.cs)
//
// All types that can hold data extend this: StructType, ArrayType, EnumType, ScalarType.
// Provides create() → DataNode factory + validateValue() + type compatibility checks.
// =============================================================================

import { NodeType } from './nodeType';
import type { NodeSchema } from '../../schema/nodeSchema';
import type { DataNode } from '../../node/dataNode';

export abstract class ValueType extends NodeType {
  /** Back-reference to wrapping array type (set by ArrayType). */
  arrayType?: ValueType;

  /** Whether this is a system-only type. */
  system = false;

  // ── DataNode factory ───────────────────────────────────────────────────

  /** Create a DataNode instance for this type. Abstract — subclasses return concrete nodes. */
  abstract create(): DataNode;

  /** Create a DataNode and set its value. Mirrors C# ValueType.From(). */
  from(value: unknown): DataNode {
    const node = this.create();
    node.trySetValue(value);
    return node;
  }

  // ── Type compatibility ─────────────────────────────────────────────────

  /** Check whether this type is compatible with another (for assignment). */
  isCompatibleWith(other: ValueType): boolean {
    if (this === other) return true;
    // Override in subclasses for type-specific checks
    return false;
  }

  /** Get the TypeScript constructor that maps to this runtime type. */
  getCsharpType(): new () => unknown {
    return Object as new () => unknown;
  }
}
