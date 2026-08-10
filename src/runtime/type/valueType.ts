// =============================================================================
// ValueType — abstract base for value-bearing runtime types
// Mirrors C# SchemaNode.Core/Runtime/Type/ValueType (in NodeType.cs)
//
// All types that can hold data extend this: StructType, ArrayType, EnumType, ScalarType.
// Provides create() → DataNode factory + validateValue() + type compatibility checks.
// =============================================================================

import { NodeType } from './nodeType';
import type { DataNode } from '../../node/dataNode';
import { IPropertyProvider, IValueAccess, IValueTypeAccess } from '../interfaces';
import { IConstraintProperty } from '../../property';
import { FunctionType } from './functionType';
import { ArrayType } from './arrayType';
import { isEmpty } from '../../utility/toolset';
import { NODE_SELF, SCHEMA_KIND_OBJECT } from '../../utility/constant';
import { Entry } from '../../struct/entry';
import { isConstraintProperty } from '../../property/constraintProperty';

/** Represents the value schema type */
export abstract class ValueType extends NodeType implements IValueTypeAccess {

  /** The converter */
  private _isAssignableTo: Map<ValueType, FunctionType> | undefined;
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

  /** Add used by */
  addUsedBy(type: NodeType): void {
    if (type instanceof FunctionType)
    {
      if (type.isConverter && type.args.length === 1 && type.args.get(0)!.type === this.name && type.returnType)
      {
        this._isAssignableTo ??= new Map();
        this._isAssignableTo.set(type.returnType, type);
      }
    }
    else if(type instanceof ArrayType && type.element === this)
    {
      this._arrayType = type;
    }
    super.addUsedBy(type);
  }

  /** Remove used by */
  removeUsedBy(type: NodeType): void {
    if (type instanceof FunctionType && type.isConverter && type.returnType && this._isAssignableTo?.get(type.returnType) === type)
      this._isAssignableTo?.delete(type.returnType);
    if (type === this.arrayType) this._arrayType = undefined;
    super.removeUsedBy(type);
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
