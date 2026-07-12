// =============================================================================
// EnumType — runtime type for enum schemas
// Mirrors C# SchemaNode.Core/Runtime/Type/EnumType.cs
// =============================================================================

import { ValueType } from './valueType';
import { EnumProperty, EnumValueAccess, type EnumSchema, type EnumValueSchema } from '../../schema/enumSchema';
import { EnumValueType, EnumValueTypeValue } from '../../enum/enumValueType';
import { IProperty } from '../../property';
import { combineProperties, getPropertiesBySchemaKind, getProperty } from '../../property/propertyOwner';
import { SCHEMA_KIND_ENUM, SCHEMA_KIND_ENUM_VALUE } from '../../utility/constant';
import { LocaleString } from '../../struct';
import { ScalarType } from './scalarType';
import { StringType } from './scalar/stringType';
import { IntType } from './scalar/intType';
import { DataNode } from '../../node/dataNode';
import { EnumNode } from '../../node/enumNode';
import { isEmpty } from '../../utility/toolset';

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
    return this._enumSchema ? getPropertiesBySchemaKind(this._enumSchema, SCHEMA_KIND_ENUM) : [];
  }

  override async load()
  {
    this._valueMaps.clear();
    this._root = { value: '', sublist: this._enumSchema?.values };
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

  override create(): DataNode { return new EnumNode(this); }

  override get isIndexable() { return true; }   

  /** Load the enum value sub list */
  async loadEnumSubList(value?: string): Promise<EnumValueSchema[]>
  {
    let fullList = false;
    if (isEmpty(value))
        return _root.Clone(fullList ? (_enumSchema?.Cascade?.Length ?? 1) : 1).SubList ?? [];

    EnumValueSchema[] accesses = await LoadEnumValueAccessAsync(context, value);
    if (accesses.Length == 0) return [];

    EnumValueSchema access = accesses.Last();
    if (!(access.HasSubList ?? false)) return [];

    // load sub list
    int chkLvl = 1;
    if (fullList)
        chkLvl = Math.Min((_enumSchema?.Cascade?.Length ?? 1) - accesses.Length + 1, MAX_SUBLIST_LEVEL);

    // full-filled
    if (UpdateLoadState(access, chkLvl))
        return access.Clone(chkLvl).SubList ?? [];

    // load sub list
    if (Provider != null && context.GetRequiredService(Provider) is IEnumSchemaProvider provider)
    {
        EnumValueSchema[] subList = await provider.LoadEnumSubListAsync(Name, value);
        lock (_lock)
        {
            access.SubList = subList;
            UpdateLoadState(access);
        }
        return access.Clone(chkLvl).SubList ?? [];
    }
    return [];
  }

  /** Load the enum value access list from the server */
  async loadEnumAccessListAsync(value: string, noSubList: boolean = false, withSubList: boolean = false): Promise<EnumValueAccess[]>
  {
      EnumValueSchema[] accesses = await LoadEnumValueAccessAsync(context, value);
      if (accesses.Length == 0) return [];
      
      withSubList = (withSubList ?? false) && accesses.Length < (_enumSchema?.Cascade?.Length ?? 1) && accesses.Last().SubList is { Length: > 0};
      EnumValueAccess[] result = new EnumValueAccess[withSubList.Value ? accesses.Length : (accesses.Length - 1)];
      for (int i = 0; i < accesses.Length - 1; i++)
      {
          result[i] = new EnumValueAccess
          {
              Value = accesses[i + 1].Value,
              Name = _enumSchema?.Cascade?[i],
              Schema = noSubList == true ? accesses[i + 1].Clone() : null,
              SubList = (noSubList ?? false) ? null : accesses[i].SubList?.Select(a => a.Clone()).ToArray()
          };
      }

      if (withSubList.Value)
      {
          result[accesses.Length - 1] = new EnumValueAccess
          {
              Value = "",
              Name = _enumSchema?.Cascade?[accesses.Length - 1],
              SubList = accesses.Last().SubList?.Select(a => a.Clone()).ToArray()
          };
      }
      
      return result;
  }

  // ── Utility ────────────────────────────────────────────────────────
  private updateLoadState(node: EnumValueSchema, level: number = 999, parent: EnumValueSchema | undefined = undefined, reset: boolean = false) {

    if (node.IsFullyLoaded && !reset || level == 0) return true;
    node.IsFullyLoaded = false;
    _valueMaps[node.Value] = node;

    // update ref
    if (parent != null)
    {
        node.Parent = parent;
        node.Level = parent.Level + 1;
    }

    // If loaded from static resources
    if (node.SubList is not null && node.SubList.Length > 0) node.HasSubList = true;

    if (node.HasSubList ?? false)
    {
        if (node.SubList is not null && node.SubList.Length > 0)
        {
            foreach (var item in node.SubList)
                UpdateLoadState(item, level - 1, node, reset);
            node.IsFullyLoaded = node.SubList.All(x => x.IsFullyLoaded);
            return true;
        }
    }
    else
    {
        node.IsFullyLoaded = true;
    }

    return node.IsFullyLoaded;
  }

  private updateMaxFlags() {
    if (_enumSchema?.Type != EnumValueType.Flags || _root.SubList == null || _root.SubList.Length == 0) return;
    long max = 0;
    try
    {
        foreach (EnumValueSchema info in _root.SubList)
        {
            if (long.TryParse(info.Value, out long val))
            {
                max = Math.Max(max, val);
            }
        }
    }
    catch
    {
        // pass
    }

    _maxFlags = max * 2;
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
  async Task<EnumValueSchema[]> LoadEnumValueAccessAsync(SchemaContext context, string? value)
  {
      if (string.IsNullOrWhiteSpace(value)) return [];

      // Try to get from cache
      if (GetAccess(value, out EnumValueSchema[]? accesses))
          return accesses ?? [];

      // Load from the provider
      if (Provider != null && context.GetRequiredService(Provider) is IEnumSchemaProvider provider)
      {
          EnumValueAccess[] accessList = await provider.LoadEnumAccessListAsync(Name, value, false, true);
          if (accessList.Length > 0)
          {
              lock (_lock)
              {
                  _root.CombineAccessList(accessList);
                  UpdateLoadState(_root);
              }
              return GetAccess(value, out accesses) ? accesses ?? [] : [];
          }
      }
      return [];

      bool GetAccess(string v, out EnumValueSchema[]? result)
      {
          result = null;
          if (!_valueMaps.TryGetValue(v, out var node)) return false;
          
          var temp = new EnumValueSchema[node.Level + 1];
          temp[node.Level] = node;
          for (int i = node.Level - 1; i >= 0; i--)
          {
              if (node.Parent == null) return false;
              node = node.Parent;
              temp[i] = node;
          }
          result = temp;
          return true;
      }
  }

}