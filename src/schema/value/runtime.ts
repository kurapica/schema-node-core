// =============================================================================
// ValueType — abstract base for value-bearing runtime types
// Mirrors C# SchemaNode.Core/Runtime/Type/ValueType (in NodeType.cs)
//
// All types that can hold data extend this: StructType, ArrayType, EnumType, ScalarType.
// Provides create() → DataNode factory + validateValue() + type compatibility checks.
// =============================================================================

import { isEmpty } from '../../utility/toolset';
import { NodeType } from '../node/runtime';
import { isConstraintProperty } from '../../interface';
import { DataNode } from './node';
import { getSchemaKindRegister, getSchemaType } from '../../runtime/schemaRuntime';
import { getMetaProperty } from '../../attribute/meta';
import { ArrayDataNodeType, DataNodeType } from '../../property/core/dataNodeType';

import type { IConstraintProperty, IValueTypeAccess, ValueAccessFactory, IValueAccess, IPropertyProvider, IArrayValueTypeAccess } from '../../interface';
import type { Entry } from '../../struct/entry/type';
import type { INodeType } from '../../interface';

import { NODE_SELF, SCHEMA_KIND_ARRAY, SCHEMA_KIND_OBJECT } from '../../utility/constant';

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
  create(value: unknown, parent?: IValueAccess, ...propProviders: IPropertyProvider[]): IValueAccess {
    // parent given data node type
    if (parent?.type instanceof ValueType && propProviders.length) {
      const name = propProviders.map(p => p?.getProperty('name')).find(p => p?.hasValue)?.getValue<string>();
      if (name) {
        const schemaType = getSchemaType(parent.type.name);
        const dataNodeType = schemaType ? getMetaProperty(schemaType, DataNodeType, name)?.getValue<ValueAccessFactory>() : undefined;
        if (dataNodeType) return new dataNodeType(this, value, parent, ...propProviders);
      }
    }

    // schema node type
    const schemaType = getSchemaType(this.name);
    const dataNodeType = schemaType ? getMetaProperty(schemaType, DataNodeType)?.getValue<ValueAccessFactory>() : undefined;
    if (dataNodeType) return new dataNodeType(this, value, parent, ...propProviders);
    
    // array node type
    if (this.kind === SCHEMA_KIND_ARRAY)
    {
      const element = (this as unknown as IArrayValueTypeAccess)?.element;
      if (element) {
        const eleKind = getSchemaKindRegister(element.kind)!;
        const arrayNodeType = getMetaProperty(eleKind, ArrayDataNodeType)?.getValue<ValueAccessFactory>();
        if (arrayNodeType) return new arrayNodeType(this, value, parent, ...propProviders);
      }
    }

    // kind node type
    const kindType = getSchemaKindRegister(this.kind)!;
    const kindDataNodeType = getMetaProperty(kindType, DataNodeType)?.getValue<ValueAccessFactory>();
    return kindDataNodeType ? new kindDataNodeType(this, value, parent, ...propProviders) : new DataNode(this, value, parent, ...propProviders);
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
