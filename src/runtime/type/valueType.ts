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
import type { IConstraintProperty } from '../../property/constraintProperty';

export abstract class ValueType extends NodeType {
  /** Constraint properties loaded from schema. */
  constraints: IConstraintProperty[] = [];

  /** Back-reference to wrapping array type (set by ArrayType). */
  arrayType?: ValueType;

  /** Converter function types that can assign to this type. */
  private _isAssignableTo = new Map<ValueType, NodeType /* FunctionType */>();

  constructor(schema: NodeSchema, genericParams?: NodeType[]) {
    super(schema, genericParams);
  }

  // ── DataNode factory ───────────────────────────────────────────────────

  /** Create a DataNode instance for this type. Abstract — subclasses return concrete nodes. */
  abstract create(): DataNode;

  /** Create a DataNode and set its value. */
  from(value: unknown): DataNode {
    const node = this.create();
    node.trySetValue(value);
    return node;
  }

  // ── Validation ─────────────────────────────────────────────────────────

  /** Validate a raw value: create DataNode → run constraints → return. */
  validateValue(value: unknown): DataNode {
    const node = this.create();
    node.trySetValue(value);
    node.validate();
    return node;
  }

  // ── Type compatibility ─────────────────────────────────────────────────

  /** Check if this type can be assigned from another type. */
  isAssignableTo(other: ValueType): boolean {
    if (this === other) return true;
    if (this._isAssignableTo.has(other)) return true;
    // system.object accepts everything
    if (this.kind === 'object') return true;
    return false;
  }

  /** Register a converter function that can convert to this type. */
  addConverter(fromType: ValueType, converter: NodeType): void {
    this._isAssignableTo.set(fromType, converter);
  }

  // ── Path navigation ────────────────────────────────────────────────────

  /** Navigate a dotted access path within this type tree. */
  getAccessValueType(path: string): ValueType | undefined {
    if (!path || path === '$self') return this;
    return undefined;
  }

  /** Whether this type can be used as a data index. */
  get isIndexable(): boolean {
    return false;
  }
}
