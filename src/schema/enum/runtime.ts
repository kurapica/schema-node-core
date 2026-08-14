// =============================================================================
// EnumType — runtime type for enum schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/EnumType.cs
// =============================================================================

import { EnumValueType } from '../../enum/enumValueType/type';
import { EntrySource } from '../../property/core/entrySource';
import { getPropertiesBySchemaKind, getPropertyValue } from '../../property/propertyOwner';
import { EntryType } from '../../struct/entry/runtime';
import { isEmpty } from '../../utility/toolset';
import { ValueType } from '../value/runtime';
import { filterSchemaKindProperties, getSchemaKindProperties, getSchemaKindProperty } from '../../runtime/schemaRuntime';
import { joinProperties } from '../../interface';
import { ScalarType } from '../value/scalar';
import { StringType } from '../string/runtime';
import { IntType } from '../int/runtime';
import { FunctionType } from '../function/runtime';
import { getNodeType } from '../../runtime/context';

import type { EnumValueTypeValue } from '../../enum/enumValueType/type';
import type { FuncCall } from '../../schema/function/type';
import type { LocaleString } from '../../struct/localeString/type';
import type { EntryAccess } from '../../struct/entry/type';
import type { EnumSchema } from './type';
import type { IProperty, PropertyCtor } from '../../interface';

import { ENTRY_ROOT, NODE_SELF, NODE_TYPE, SCHEMA_KIND_ENUM } from '../../utility/constant';

export class EnumType extends ValueType {
  private _enumSchema: EnumSchema | undefined;
  private _maxFlags: number | undefined;
  private _root: EntryType<string> = new EntryType<string>();

  /** The enum value type */
  get type(): EnumValueTypeValue { return this._enumSchema?.type ?? EnumValueType.String } 

  /** Gets the enum cascade */
  get cascade(): LocaleString[] | undefined { return this._enumSchema?.cascade }

  /** Gets the max flags value for flags enum */
  get maxFlags(): number | undefined { return this._maxFlags }

  override loadProperties(): IProperty[] {
    this._enumSchema = getPropertyValue<EnumSchema>(this.schema, "enum");
    return this._enumSchema ? Array.from(getPropertiesBySchemaKind(this._enumSchema, SCHEMA_KIND_ENUM)) : [];
  }

  override async load()
  {
    if (this._enumSchema?.type === EnumValueType.Flags)
    {
      this._maxFlags = 0;
      for(let v of this._enumSchema.values){
        const value = parseInt(v.value) ?? 0;
        if (isNaN(value)) continue;
        this._maxFlags |= value;
      }
    }

    // init
    this._root = new EntryType<string>();
    this._root.saveAccessList([
      {
        children: this._enumSchema?.values
      }
    ]);
  }

  override getProperty<T extends IProperty>(propCtor: PropertyCtor | string): T | undefined {
    // enable prototype properties
    return super.getProperty<T>(propCtor) ?? getSchemaKindProperty<T>(this.kind, propCtor);
  }

  override *getProperties<T extends IProperty>(propCtor: PropertyCtor | string): Generator<T> {
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