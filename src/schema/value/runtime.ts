// =============================================================================
// ValueType — abstract base for value-bearing runtime types
// Mirrors C# SchemaNode.Core/Runtime/Type/ValueType (in NodeType.cs)
//
// All types that can hold data extend this: StructType, ArrayType, EnumType, ScalarType.
// Provides create() → DataNode factory + validateValue() + type compatibility checks.
// =============================================================================

import { type IConstraintProperty, isConstraintProperty } from '../../interface/valueAccess';
import { isEmpty } from '../../utility/toolset';
import { NODE_SELF, SCHEMA_KIND_OBJECT } from '../../utility/constant';
import type { Entry } from '../../struct/entry';
import { NodeType } from '../node/runtime';
import type { IValueTypeAccess } from '../../interface/valueTypeAccess';
import type { IValueAccess } from '../../interface/valueAccess';
import type { IPropertyProvider } from '../../interface/propertyProvider';
import type { DataNode } from './node';
import type { INodeType } from '../../interface';

/** Represents the value schema type */
export abstract class ValueType extends NodeType implements IValueTypeAccess {

  /** The converter */
  private _isAssignableTo: Map<ValueType, INodeType> | undefined;
  private _arrayType: ValueType | undefined;

  /** The constraint properties */
  get constraints(): IConstraintProperty[] {
    const constraints = Array.from(this.filterProperties(isConstraintProperty)) as IConstraintProperty[];
    constraints.reverse();
    return constraints;
  }

  /** Back-reference to wrapping array type (set by ArrayType). */
  get arrayType(): ValueType | undefined {
    return this._arrayType;
  }

  // ── DataNode factory ─────────────────────────────────────────────────── 

  /** Create a DataNode instance for this type. Abstract — subclasses return concrete nodes. */
  abstract create(value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider): DataNode;

  // ── Virtual ────────────────────────────────────────────────────────────

  /** Whether the type can be used as data index */
  get isIndexable () { return false }

  /** Gets the value type through path part */
  getAccessValueType(path: string): ValueType | undefined {
    return isEmpty(path) || path.toLowerCase() === NODE_SELF ? this : undefined;
  }

  /** Gets the access entries */
  getAccessEntries(): Entry<string>[] { return [] }

  /** Whether this node has access entries. */
  get hasAccessEntries(): boolean { return false }

  // ── Type compatibility ─────────────────────────────────────────────────

  /** Add converter */
  addConverter(other: ValueType, converter: INodeType)
  {
    this._isAssignableTo ??= new Map();
    this._isAssignableTo.set(other, converter);
  }

  /** Get converter */
  getConverter(other: ValueType): INodeType | undefined
  {
    // @TODO: do more check
    return this._isAssignableTo?.get(other);
  }

  /** Remove converter */
  removeConverter(other: ValueType, converter: INodeType)
  {
    if (!this._isAssignableTo?.has(other)) return;
    if (this._isAssignableTo.get(other) === converter)
      this._isAssignableTo?.delete(other);
  }

  /** Set array type */
  setArrayType(arrayType: ValueType | undefined)
  {
    this._arrayType = arrayType;
  }

  /** Remove array type */
  removeArrayType(arrayType: ValueType | undefined)
  {
    if (this._arrayType !== arrayType) return;
    this._arrayType = undefined;
  }

  /** Check whether this type is compatible with another (for assignment). */
  isAssignableTo(other: ValueType): boolean {
    return this === other || this.name === other.name || 
      this.kind === SCHEMA_KIND_OBJECT || 
      other.kind === SCHEMA_KIND_OBJECT || 
      (this._isAssignableTo ? (
        this._isAssignableTo.has(other) || 
        this._isAssignableTo?.keys().some(k => k.isAssignableTo(other))
      ) : false)
  }
}
