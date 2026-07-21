// =============================================================================
// EnumType — runtime type for enum schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/EnumType.cs
// =============================================================================

import { ValueType } from './valueType';
import { EnumProperty, type EnumSchema } from '../../schema/enumSchema';
import { EnumValueType, EnumValueTypeValue } from '../../enum/enumValueType';
import { EntrySource, FuncCall, IProperty } from '../../property';
import { getPropertiesBySchemaKind, getProperty } from '../../property/propertyOwner';
import { ENTRY_ROOT, NODE_SELF, NODE_TYPE, SCHEMA_KIND_ENUM } from '../../utility/constant';
import { LocaleString } from '../../struct';
import { ScalarType } from './scalarType';
import { StringType } from './scalar/stringType';
import { IntType } from './scalar/intType';
import { DataNode } from '../../node/dataNode';
import { EnumNode } from '../../node/enumNode';
import { IValueAccess, joinProperties } from '../interfaces';
import { filterSchemaKindProperties, getNodeType, getSchemaKindProperties, getSchemaKindProperty } from '../schemaRuntime';
import { EntryAccess, EntryType } from '../../struct/entry';
import { isEmpty } from '../../utility/toolset';
import { FunctionType } from './functionType';

export class EnumType extends ValueType {
  private _enumSchema: EnumSchema | undefined;
  private _maxFlags: number | undefined;
  private _root: EntryType<string> = new EntryType<string>();

  /** The enum value type */
  get type(): EnumValueTypeValue { return this._enumSchema?.type ?? EnumValueType.String } 

  /** Gets the enum cascade */
  get cascade(): LocaleString[] | undefined { return this._enumSchema?.cascade }

  override loadProperties(): IProperty[] {
    this._enumSchema = getProperty(this.schema, EnumProperty)?.getValue();
    return this._enumSchema ? getPropertiesBySchemaKind(this._enumSchema, SCHEMA_KIND_ENUM).toArray() : [];
  }

  override async load()
  {
    if (this._enumSchema?.type === EnumValueType.Flags)
    {
      this._maxFlags = 0;
      for(let v of this._enumSchema.values)
        this._maxFlags |= parseInt(v.value) ?? 0;
    }

    // init
    this._root = new EntryType<string>();
    this._root.saveAccessList([
      {
        children: this._enumSchema?.values
      }
    ]);
  }

  override getProperty<T extends IProperty>(propCtor: new () => T): T | undefined {
    // enable prototype properties
    return super.getProperty<T>(propCtor) ?? getSchemaKindProperty<T>(this.kind, propCtor);
  }

  override *getProperties<T extends IProperty>(propCtor: new () => T): Generator<T> {
    return joinProperties(super.getProperties<T>(propCtor), getSchemaKindProperties<T>(this.kind, propCtor));
  }

  override filterProperties(predicate: (prop: IProperty) => boolean): Generator<IProperty> {
    return joinProperties(super.filterProperties(predicate), filterSchemaKindProperties(this.kind, predicate));
  }

  override isAssignableTo(other: ValueType): boolean {
    if (super.isAssignableTo(other)) return true;
    if (other instanceof ScalarType)
    {
      switch(this.type)
      {
        case EnumValueType.String:
          return other instanceof StringType;
        case EnumValueType.Int:
        case EnumValueType.Flags:
          return other instanceof IntType;
      }
    }
    return false;
  }

  override create(value: unknown = undefined, parent: IValueAccess | undefined = undefined): DataNode { return new EnumNode(this, value, parent); }

  override get isIndexable() { return true; }   

  /** Gets the enum entry access by value and start value (Deprecated) */
  async getEnumEntryAccess(value: string | undefined = undefined, start: string | undefined = undefined): Promise<EntryAccess<string>[]>{
    if (isEmpty(value)) value = undefined;
    if (isEmpty(start)) start = undefined;

    let root:EntryType<string> | undefined = (start ? this._root.getEntry(start) : undefined) ?? this._root;
    let access: EntryAccess<string>[] | undefined = root.getAccessList(value);
    if (access?.length || root.isFullyLoaded) return access ?? [];
    
    // gets with entry source
    const entrySource = this.getProperty(EntrySource)?.getValue<FuncCall>();
    if (!entrySource) return [];

    const source = await getNodeType(entrySource.func) as FunctionType;
    if (!source) return [];

    access = await source.call(entrySource.args.map(m => {
      if (m.source)
      {
        if (m.source === NODE_TYPE)
        {
          return this.name;
        }
        else if(m.source === NODE_SELF)
        {
          return value;
        } 
        else if(m.source === ENTRY_ROOT)
        {
          return start;
        }
      }
      else
      {
        return m.value;
      }
    })) as EntryAccess<string>[];

    if (!access?.length) return [];

    // returns the access list
    root.saveAccessList(access);
    if (root.isRoot && start)
      root = root.getEntry(start);
    return root?.getAccessList(value) ?? [];
  }
}