// =============================================================================
// ValueType — abstract base for value-bearing runtime types
// Mirrors C# SchemaNode.Core/Runtime/Type/ValueType (in NodeType.cs)
//
// All types that can hold data extend this: StructType, ArrayType, EnumType, ScalarType.
// Provides create() → DataNode factory + validateValue() + type compatibility checks.
// =============================================================================

import type { IConstraintProperty, IValueTypeAccess, ValueAccessFactory, IValueAccess, IPropertyProvider } from '../../interface';
import { isEmpty } from '../../utility/toolset';
import { NODE_SELF, SCHEMA_KIND_OBJECT } from '../../utility/constant';
import type { Entry } from '../../struct/entry';
import { NodeType } from '../node/runtime';
import { isConstraintProperty  } from '../../interface';
import { DataNode } from './node';
import type { INodeType } from '../../interface';
import { getSchemaKindRegister, getSchemaType } from '../../runtime/schemaRuntime';
import { getMetaProperty } from '../../attribute/meta';
import { DataNodeType } from '../../property/core/dataNodeType';

/** Represents the value schema type */
export abstract class ValueType extends NodeType implements IValueTypeAccess {

  /** The converter */
  private _isAssignableTo: Map<IValueTypeAccess, INodeType> | undefined;
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
  create(value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider): IValueAccess {
    // check parent given data node type
    if (parent?.type instanceof ValueType && propProvider?.getProperty('name')?.hasValue) {
      const schemaType = getSchemaType(parent.type.name);
      const dataNodeType = schemaType ? getMetaProperty(schemaType, DataNodeType, propProvider.getProperty('name')!.getValue<string>())?.getValue<ValueAccessFactory>() : undefined;
      if (dataNodeType) return new dataNodeType(this, value, parent, propProvider);
    }

    const schemaType = getSchemaType(this.name);
    const dataNodeType = schemaType ? getMetaProperty(schemaType, DataNodeType)?.getValue<ValueAccessFactory>() : undefined;
    if (dataNodeType) return new dataNodeType(this, value, parent, propProvider);
    
    const kindType = getSchemaKindRegister(this.kind)!;
    const kindDataNodeType = getMetaProperty(kindType, DataNodeType)?.getValue<ValueAccessFactory>();
    return kindDataNodeType ? new kindDataNodeType(this, value, parent, propProvider) : new DataNode(this, value, parent, propProvider);
  }

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
  isAssignableTo(other: IValueTypeAccess): boolean {
    return this === other ||
      this.kind === SCHEMA_KIND_OBJECT || 
      other.kind === SCHEMA_KIND_OBJECT || 
      (this._isAssignableTo ? (
        this._isAssignableTo.has(other) || 
        this._isAssignableTo?.keys().some(k => k.isAssignableTo(other))
      ) : false)
  }
}
