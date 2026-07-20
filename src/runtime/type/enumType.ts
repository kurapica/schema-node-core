// =============================================================================
// EnumType — runtime type for enum schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/EnumType.cs
// =============================================================================

import { ValueType } from './valueType';
import { EnumProperty, type EnumSchema } from '../../schema/enumSchema';
import { EnumValueType, EnumValueTypeValue } from '../../enum/enumValueType';
import { IProperty } from '../../property';
import { combineProperties, getPropertiesBySchemaKind, getProperty } from '../../property/propertyOwner';
import { SCHEMA_KIND_ENUM } from '../../utility/constant';
import { LocaleString } from '../../struct';
import { ScalarType } from './scalarType';
import { StringType } from './scalar/stringType';
import { IntType } from './scalar/intType';
import { DataNode } from '../../node/dataNode';
import { EnumNode } from '../../node/enumNode';
import { isEmpty } from '../../utility/toolset';
import { getSchemaProvider } from '../../schema/provider/schemaProvider';
import { IValueAccess } from '../interfaces';
import { getSchemaKindProperty } from '../schemaRuntime';

const MAX_SUBLIST_LEVEL = 3;

export class EnumType extends ValueType {
  private _enumSchema: EnumSchema | undefined;
  private _maxFlags: number | undefined;
  private _root: EnumValueSchema = { value: '' };
  private _valueMaps = new Map<string, EnumValueSchema>();

  /** The enum value type */
  get type(): EnumValueTypeValue { return this._enumSchema?.type ?? EnumValueType.String } 

  /** Gets the enum cascade */
  get cascade(): LocaleString[] | undefined { return this._enumSchema?.cascade }

  /** Enum value tree. */
  values: EnumValueSchema[] = [];

  override loadProperties(): IProperty[] {
    this._enumSchema = getProperty(this.schema, EnumProperty)?.getValue();
    return this._enumSchema ? getPropertiesBySchemaKind(this._enumSchema, SCHEMA_KIND_ENUM).toArray() : [];
  }

  override async load()
  {
    this._valueMaps.clear();
    this._root = { value: '', subList: this._enumSchema?.values };
    this.updateLoadState(this._root, undefined, undefined, true);
    this.updateMaxFlags();
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

  override getProperty<T extends IProperty>(propCtor: new () => T): T | undefined {
    return super.getProperty<T>(propCtor) ?? getSchemaKindProperty<T>(SCHEMA_KIND_ENUM, propCtor);
  }

  override create(value: unknown = undefined, parent: IValueAccess | undefined = undefined): DataNode { return new EnumNode(this, value, parent); }

  override get isIndexable() { return true; }   

  /** Load the enum value sub list */
  async loadEnumSubList(value?: string): Promise<EnumValueSchema[]>
  {
    let fullList = false;
    if (isEmpty(value))
        return this.clone(this._root, fullList ? (this._enumSchema?.cascade?.length ?? 1) : 1).subList ?? [];

    const accesses = await this.loadEnumValueAccess(value);
    if (!accesses?.length) return [];

    const access = accesses[accesses.length - 1];
    if (!(access.hasSubList ?? false)) return [];

    // load sub list
    let chkLvl = 1;
    if (fullList)
        chkLvl = Math.min((this._enumSchema?.cascade?.length ?? 1) - accesses.length + 1, MAX_SUBLIST_LEVEL);

    // full-filled
    if (this.updateLoadState(access, chkLvl))
        return this.clone(access, chkLvl).subList ?? [];

    // load sub list
    const provider = getSchemaProvider();
    if (provider)
    {
        const subList = await provider.loadEnumSubList(this.name, value);
        access.subList = subList;
        this.updateLoadState(access);
        return this.clone(access, chkLvl).subList ?? [];
    }
    return [];
  }

  /** Load the enum value access list from the server */
  async loadEnumAccessListAsync(value: string, noSubList: boolean = false, withSubList: boolean = false): Promise<EnumValueAccess[]>
  {
    const accesses = await this.loadEnumValueAccess(value);
    if (!accesses?.length) return [];
    
    withSubList = (withSubList ?? false) && accesses.length < (this._enumSchema?.cascade?.length ?? 1) && accesses[accesses.length - 1].subList?.length ? true : false;
    const result: EnumValueAccess[] = []; // new EnumValueAccess[withSubList.Value ? accesses.Length : (accesses.Length - 1)];
    for (let i = 0; i < accesses.length - 1; i++)
    {
        result[i] =
        {
            value: accesses[i + 1].value,
            name: this._enumSchema?.cascade ? this._enumSchema.cascade[i] : undefined,
            schema: noSubList == true ? this.clone(accesses[i + 1]) : undefined,
            subList: (noSubList ?? false) ? undefined : accesses[i].subList?.map(a => this.clone(a))
        };
    }

    if (withSubList)
    {
        result[accesses.length - 1] =
        {
            value: "",
            name: this._enumSchema?.cascade ? this._enumSchema.cascade[accesses.length - 1] : undefined,
            subList: accesses[accesses.length - 1].subList?.map(a => this.clone(a))
        };
    }
    
    return result;
  }

  // ── Utility ────────────────────────────────────────────────────────
  private updateLoadState(node: EnumValueSchema, level: number = 999, parent: EnumValueSchema | undefined = undefined, reset: boolean = false) {
    if (node.isFullyLoaded && !reset || level == 0) return true;
    node.isFullyLoaded = false;
    this._valueMaps.set(node.value, node);

    // update ref
    if (parent != null)
    {
      node.parent = parent;
      node.level = (parent.level ?? 0) + 1;
    }

    // If loaded from static resources
    if (node.subList?.length) node.hasSubList = true;

    if (node.hasSubList)
    {
      if (node.subList?.length)
      {
        for (let item of node.subList)
            this.updateLoadState(item, level - 1, node, reset);
        node.isFullyLoaded = !node.subList.some(x => !x.isFullyLoaded);
        return true;
      }
    }
    else
    {
      node.isFullyLoaded = true;
    }

    return node.isFullyLoaded;
  }

  private updateMaxFlags(): void {
    if (this._enumSchema?.type != EnumValueType.Flags || !this._root.subList?.length) return;
    let max = 0;
    for(let info of this._root.subList)
      max |= parseInt(info.value);
    this._maxFlags = max;
  }

  /** Clones the enum value with limit level */
  private clone(enumValue: EnumValueSchema, limitLevel: number = 0): EnumValueSchema
  {
      const schema: EnumValueSchema = 
      {
          value: enumValue.value,
          hasSubList: enumValue.hasSubList,
          subList: (enumValue.hasSubList ?? false) && enumValue.subList?.length && limitLevel > 0 
              ? enumValue.subList.map(e => this.clone(e, limitLevel - 1))
              : undefined
      };
      combineProperties(schema, enumValue, SCHEMA_KIND_ENUM_VALUE);
      return schema;
  }
  
  /** CombineProperties the access list */
  private combineAccessList(enumValue: EnumValueSchema, accesses: EnumValueAccess[]): void
  {
      if (!accesses?.length) return;
      const current = accesses[0];

      if (current.subList?.length)
      {
          // replace with new
          if (enumValue.subList?.length) {
              for (let v of current.subList)
              {
                  const match = enumValue.subList.find(x => x.value.toLowerCase() === v.value.toLowerCase());
                  if (match) v.subList = match.subList;
              }
          }

          enumValue.subList = current.subList;

          if (accesses.length > 1)
          {
              const match = enumValue.subList.find(x => x.value.toLowerCase() === current.value.toLowerCase());
              if (match)
                this.combineAccessList(match, accesses.slice(1));;
          }
      }
  }
  
  // Load the enum value access path
  async loadEnumValueAccess(value: string = ''): Promise<EnumValueSchema[]>
  {
      if (isEmpty(value)) return [];

      // Try to get from cache
      let accesses = this.getAccess(value);
      if (accesses) return accesses;

      // Load from the provider
      const provider = getSchemaProvider();
      if (provider)
      {
          const accessList = await provider.loadEnumAccessList(this.name, value, false, true);
          if (accessList?.length)
          {
              this.combineAccessList(this._root, accessList);
              this.updateLoadState(this._root);
              return this.getAccess(value) ?? [];
          }
      }
      return [];
  }

  getAccess(v: string): EnumValueSchema[] | undefined
  {
    let node = this._valueMaps.get(v);
    if (!node) return undefined;
    
    const temp: EnumValueSchema[] = [];
    temp.unshift(node);

    for (let i = (node.level ?? 0) - 1; i >= 0; i--)
    {
        if (node?.parent == null) return undefined;
        node = node.parent;
        temp.unshift(node);
    }
    return temp;
  }
}