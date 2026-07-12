// =============================================================================
// ValueType — abstract base for value-bearing runtime types
// Mirrors C# SchemaNode.Core/Runtime/Type/ValueType (in NodeType.cs)
//
// All types that can hold data extend this: StructType, ArrayType, EnumType, ScalarType.
// Provides create() → DataNode factory + validateValue() + type compatibility checks.
// =============================================================================

import { NodeType } from './nodeType';
import type { DataNode } from '../../node/dataNode';
import { IValueTypeAccess } from '../interfaces';
import { IConstraintProperty } from '../../property';
import { NodeSchema } from '../../schema/nodeSchema';
import { FunctionType } from './functionType';
import { ArrayType } from './arrayType';
import { isEmpty } from '../../utility/toolset';
import { NODE_SELF, SCHEMA_KIND_OBJECT } from '../../utility/constant';
import { Entry } from '../../struct/entry';

/** Represents the value schema type */
export abstract class ValueType extends NodeType implements IValueTypeAccess {

  /** The converter */
  private _isAssignableTo: Map<ValueType, FunctionType> | undefined;

  /** The constraint properties */
  constraints: IConstraintProperty[] | undefined;

  /** Back-reference to wrapping array type (set by ArrayType). */
  arrayType?: ValueType;

  async loadType(schema: NodeSchema, genericParams?: NodeType[]): Promise<void> {
    await super.loadType(schema, genericParams);
    this.constraints = this.properties.filter(p => typeof (p as any).validate !== 'function') as IConstraintProperty[];
  }

  // ── DataNode factory ─────────────────────────────────────────────────── 

  /** Create a DataNode instance for this type. Abstract — subclasses return concrete nodes. */
  abstract create(): DataNode;

  /** Create a DataNode and set its value. Mirrors C# ValueType.From(). */
  from(value: unknown): DataNode {
    const node = this.create();
    node.trySetValue(value);
    return node;
  }

  // ── Virtual ────────────────────────────────────────────────────────────

  /** Whether the type can be used as data index */
  get isIndexable () { return false }

  /** Gets the value type through path part */
  getAccessValueType(path: string): ValueType | undefined {
    return isEmpty(path) || path === NODE_SELF ? this : undefined;
  }

  // ── Sub Entries ────────────────────────────────────────────────────────

  getSubEntries(): Entry<string>[] { return [] }

  get hasSubEntries() { return false }

  // ── Type compatibility ─────────────────────────────────────────────────

  /** Add used by */
  addUsedBy(type: NodeType): void {
    if (type instanceof FunctionType)
    {
      if (type.isConverter && type.args.length === 1 && type.args[0].type === this.name && type.returnType)
      {
        this._isAssignableTo ??= new Map<ValueType, FunctionType>();
        this._isAssignableTo.set(type.returnType, type);
      }
    }
    else if(type instanceof ArrayType && type.element === this)
    {
      this.arrayType = type;
    }
    super.addUsedBy(type);
  }

  /** Remove used by */
  removeUsedBy(type: NodeType): void {
    if (type instanceof FunctionType && type.isConverter && type.returnType && this._isAssignableTo?.get(type.returnType) === type)
      this._isAssignableTo?.delete(type.returnType);
    if (type === this.arrayType) this.arrayType = undefined;
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
