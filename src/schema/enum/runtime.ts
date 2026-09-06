// =============================================================================
// EnumType — runtime type for enum schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/EnumType.cs
// =============================================================================

import { EnumValueType } from '../../enum/enumValueType/type';
import { EntryRoot, EntrySource } from '../../property/core/entrySource';
import { getPropertiesBySchemaKind, getPropertyValue, setPropertyValue } from '../../property/propertyOwner';
import { EntryType } from '../../struct/entry/runtime';
import { isEmpty, isNull } from '../../utility/toolset';
import { ValueType } from '../value/runtime';
import { filterSchemaKindProperties, getSchemaKindProperties, getSchemaKindProperty } from '../../runtime/schemaRuntime';
import { joinProperties } from '../../interface';
import { ScalarType } from '../value/scalar';
import { StringType } from '../string/runtime';
import { IntType } from '../int/runtime';
import { FunctionType } from '../function/runtime';
import { getNodeType } from '../../runtime/context';
import { SchemaLoadState } from '../../enum';
import { EnumProperty } from './enum';
import { buildFuncCall, type FuncCall } from '../../schema/function/type';

import type { EnumValueTypeValue } from '../../enum/enumValueType/type';
import type { LocaleString } from '../../struct/localeString/type';
import type { Entry, EntryAccess } from '../../struct/entry/type';
import type { EnumSchema } from './type';
import type { IProperty, PropertyCtor } from '../../interface';

import { NODE_SELF, TYPE_PROVIDER, SCHEMA_KIND_ENUM, NS_SYSTEM_SCHEMA_REFLECT_ENUM } from '../../utility/constant';


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
    const entrySource = new EntrySource();
    entrySource.setValue<FuncCall>(buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.getenumaccess`, this.name, NODE_SELF));
    return this._enumSchema ? Array.from(getPropertiesBySchemaKind(this._enumSchema, SCHEMA_KIND_ENUM)).concat(entrySource) : [entrySource];
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
    for (let prop of joinProperties(super.getProperties<T>(propCtor), getSchemaKindProperties<T>(this.kind, propCtor))) yield prop as T;
  }

  override *filterProperties(predicate: (prop: IProperty) => boolean): Generator<IProperty> {
    for (let prop of joinProperties(super.filterProperties(predicate), filterSchemaKindProperties(this.kind, predicate))) yield prop;
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

    access = await source.call(source.args.map((a, i) => {
      const m = entrySource.args[i];
      if (!m || isNull(m.source) && isNull(m.value)) {
        // handle entry root
        if (a.getPropertyValue<boolean>(EntryRoot))
          return start;
        return undefined;
      }

      if(m.source === NODE_SELF)
        return value;
      
      return m.value;
    })) as EntryAccess<string>[];

    if (!access?.length) return [];

    // returns the access list
    root.saveAccessList(access);
    if (root.isRoot && start)
      root = root.getEntry(start);
    return root?.getAccessList(value) ?? [];
  }

  /** Saves the enum sub list, only works for frontend schema */
  saveEnumSubList(value: string, children: Entry<string>[] | undefined) {
    if ((this.schema?.loadState ?? 0) & (SchemaLoadState.System | SchemaLoadState.Service)) return;
    const entry = this._root.getEntry(value);
    if (!entry) return;
    if (!children?.length)
      entry.dropChildren();
    else
      entry.saveAccessList([{
        entry: { value, hasChildren: true },
        children
      }]);

    this._enumSchema!.values = this._root.fullEntry.children ?? [];
    setPropertyValue(this.schema, EnumProperty, this._enumSchema);
  }
}