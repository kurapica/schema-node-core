import { Disable } from "../../property/common/disable";
import { BlackList } from "../../property/constraint/blackList";
import { Cascade } from "../../property/constraint/cascade";
import { Root } from "../../property/constraint/root";
import { Valid } from "../../property/constraint/valid";
import { WhiteList } from "../../property/constraint/whiteList";
import { AccessEntryConsumer } from "../../property/core/accessEntryConsumer";
import { AccessValueTypeProvider } from "../../property/core/accessValueTypeProvider";
import { EntrySource, EntrySourceVersion } from "../../property/core/entrySource";
import { EntrySourceConsumer } from "../../property/core/entrySourceConsumer";
import { EntrySourceProvider } from "../../property/core/entrySourceProvider";
import { getPropertyValue, setPropertyValue } from "../../property/propertyOwner";
import { getNodeType } from "../../runtime/context";
import { EntryType } from "../../struct/entry/runtime";
import { DataNode } from "../value/node";
import { debounce, isEmpty, isEqual, useQueueQuery } from "../../utility/toolset";
import { _L, _LS } from "../../utility/locale";

import type { IPropertyProvider, IValueAccess, IValueTypeAccess } from "../../interface";
import type { FunctionType } from "../function/runtime";
import type { CallArg, FuncCall } from "../function/type";
import type { Entry, EntryAccess } from "../../struct/entry/type";
import type { LocaleString } from "../../struct/localeString";
import type { FuncCallProperty } from "../../property/funcCallProperty";

import { ENTRY_ROOT, NODE_SELF, NODE_TYPE } from "../../utility/constant";

/** The data node represets the scalar types */
export abstract class ScalarNode extends DataNode {
  // #region ── ctor & dtor ───────────────────────────────────────────────────

  private _entrySourceInfo?: IEntrySourceInfo;

  /** Construct the data node with value type, parent and init value, alternative property provider */
  constructor(type: IValueTypeAccess, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, value, parent, propProvider);
    this.recordSubscription(this.subscribeSelfProperty(WhiteList, this._refreshEntrySource));
    this.recordSubscription(this.subscribeSelfProperty(BlackList, this._refreshEntrySource));
    this.recordSubscription(this.subscribeSelfProperty(Valid, this._refreshEntrySource));
    this.recordSubscription(this.subscribeSelfProperty(Root, this._refreshEntrySource));
    this.recordSubscription(this.subscribeSelfProperty(Cascade, this._refreshEntrySource));
    this.recordSubscription(this.subscribeSelfProperty(EntrySource, this._refreshEntrySource, true));
  }

  // #endregion

  // #region ── Entry Source ───────────────────────────────────────────────────

  /** Whether the data node has entry source */
  get hasEntrySource(): boolean { return !!this._entrySourceInfo?.rootEntry; }

  /** Whether the data node use single level entry source */
  get isSingleLevel(): boolean { return this._entrySourceInfo?.singleLevel ?? false; }

  /** Whether the data node use non leaf node selectable */
  get isNonLeafNodeSelectable(): boolean { return this._entrySourceInfo?.allRootPassed ?? false; }

  /** Gets the default display text for the current value */
  async getDisplayValue(sep?: string): Promise<string> { 
    if (isEmpty(this.value)) return "";
    if (!this.hasEntrySource) return `${this.value}`;

    const access = await this.getEntryAccessList(this.value);
    if (!access?.length || !access[access.length - 1].entry) return `${this.value}`;

    if (sep) 
    {
      return access.filter(item => item.entry).map(item => {
        const display = getPropertyValue<LocaleString>(item.entry, "display");
        return display ? _L(display) : `${item.entry!.value}`;
      }).join(sep);
    }
    else
    {
      const entry = access[access.length - 1].entry;
      const display = getPropertyValue<LocaleString>(entry, "display");
      return display ? _L(display) : `${this.value}`;
    }
  }

  /** refresh the options with entry source & white list & black list */
  private _refreshEntrySource = debounce(useQueueQuery(async () => {
    this._entrySourceInfo ??= {};
    this._entrySourceInfo.initing = true;

    const whiteList = this.getPropertyValue<string[]>(WhiteList);
    const blackList = this.getPropertyValue<string[]>(BlackList);

    // entry source
    let entrySourceProp = this.getProperty(EntrySource)
    let entrySource = entrySourceProp?.getValue<FuncCall>();
    const root = this.getPropertyValue<string>(Root);
    const cascade = this.getPropertyValue<number>(Cascade);

    // entry source owner
    let owner = entrySourceProp?.source;
    const valids = Array.from(this.getProperties(Valid)).filter(item => item.hasValue) as FuncCallProperty[]; // require property source
    valids.reverse(); // old first

    // access consumer to access access source from ancestors
    const accessValueTypeConsumer = this.getPropertyValue<FuncCall>(AccessEntryConsumer);
    if (!entrySource?.func && (accessValueTypeConsumer || this.getPropertyValue<boolean>(EntrySourceConsumer)))
    {
      let parent: IValueAccess | undefined = this;
      while (parent)
      {
        entrySource = parent.getPropertyValue<FuncCall>(EntrySourceProvider);
        if (entrySource) {
          owner = parent;
          break;
        }
        parent = parent.parent;
      }
    }
    const entryFunc = entrySource?.func ? await getNodeType(entrySource.func) as FunctionType : undefined;

    // access value type handler
    if (accessValueTypeConsumer && !this._entrySourceInfo?.valueTypeProvider)
    {
      let parent: IValueAccess | undefined = this;
      while (parent)
      {
        const accessValueTypeProvider = parent.getPropertyValue<FuncCall>(AccessValueTypeProvider);
        if (accessValueTypeProvider) {
          this._entrySourceInfo ??= {};

          this._entrySourceInfo.valueTypeProvider = accessValueTypeProvider.func ? await getNodeType(accessValueTypeProvider.func) as FunctionType : undefined;
          this._entrySourceInfo.valueTypeProviderArgs = accessValueTypeProvider.args.map(a => this._callArgToEntrySource(parent!, a));

          this._entrySourceInfo.valueTypeConsumer = accessValueTypeConsumer.func ? await getNodeType(accessValueTypeConsumer.func) as FunctionType : undefined;
          this._entrySourceInfo.valueTypeConsumerArgs = accessValueTypeConsumer.args.map(a => this._callArgToEntrySource(parent!, a));

          break;
        }
        parent = parent.parent;
      }
    }

    if (entryFunc)
    {
      // refresh options if relatied properties changed
      if (this._entrySourceInfo.source !== entryFunc || 
          this._entrySourceInfo.cascade !== cascade || 
          this._entrySourceInfo.root !== root ||
          this._entrySourceInfo.owner !== owner ||
          !isEqual(this._entrySourceInfo.whiteList, whiteList) ||
          !isEqual(this._entrySourceInfo.blackList, blackList) ||
          !(this._entrySourceInfo.valids?.length === valids.length && this._entrySourceInfo.valids?.every((item, i) => item.prop === valids[i])))
      {
        this._entrySourceInfo.owner = owner;
        this._entrySourceInfo.whiteList = whiteList;
        this._entrySourceInfo.blackList = blackList;
        this._entrySourceInfo.source = entryFunc;
        this._entrySourceInfo.cascade = cascade;
        this._entrySourceInfo.root = root;
        this._entrySourceInfo.subscribes?.forEach(sub => sub());
        this._entrySourceInfo.subscribes = undefined;
        this._entrySourceInfo.rootEntry = new EntryType<any>();
        this._entrySourceInfo.rootEntry.value = root;
        this._entrySourceInfo.args = entrySource!.args.map(a => this._callArgToEntrySource(owner!, a));
        
        this._entrySourceInfo.valids = [];
        for(const item of valids)
        {
          const funcCall = item.getValue<FuncCall>()!;
          this._entrySourceInfo.valids.push({
            prop: item,
            func: await getNodeType(funcCall.func) as FunctionType,
            args: funcCall.args.map(a => this._callArgToEntrySource(item.source ?? this, a)),
          });
        }

        // init options
        this._entrySourceInfo.initing = false;
        await this._initEntryOptions();
      }
      return;
    }
    else if (this._entrySourceInfo?.source)
    {
      this._entrySourceInfo.source = undefined;
      this._entrySourceInfo.subscribes?.forEach(sub => sub());
      this._entrySourceInfo.subscribes = undefined;
    }
    
    // Simple case
    if (whiteList?.length && !isEqual(this._entrySourceInfo?.whiteList, whiteList))
    {
      this._entrySourceInfo ??= {};
      this._entrySourceInfo.rootEntry = new EntryType<any>();
      this._entrySourceInfo.singleLevel = true;
      this._entrySourceInfo.whiteList = whiteList;
      this._entrySourceInfo.rootEntry.saveAccessList([
        {
          children: whiteList.filter(item => !blackList?.includes(item)).map(item => ({
            value: item,
            display: _LS(item),
            hasChildren: false,
          }))
        }
      ]);
      // notify version change
      this._nextEntrySourceVer();
      this._entrySourceInfo.initing = false;
    }
    else if (this._entrySourceInfo)
    {
      delete this._entrySourceInfo;

      // notify version change
      this._nextEntrySourceVer();
    }
  }), 10);

  /** convert call arg to entry source arg */
  private _callArgToEntrySource(owner: IValueAccess, a: CallArg): IEntrySourceArg
  {
    const result: IEntrySourceArg = { value: a.value };
    if (a.source === NODE_SELF)
    {
      result.source = this;
    }
    else if(a.source === NODE_TYPE)
    {
      result.value = this.type.name;
    }
    else if(a.source === ENTRY_ROOT)
    {
      result.isroot = true;
    }
    else if (a.source)
    {
      const target = owner.getAccessValue(a.source);
      if (target)
      {
        result.source = target;
        if (target !== this) {
          this._entrySourceInfo ??= {};
          this._entrySourceInfo.subscribes ??= [];
          this._entrySourceInfo.subscribes.push(target.subscribe(this._delayInitEntryOptions));
        }
      }
    }
    return result;
  }

  /** init options with entry source args */
  private _initEntryOptions = async () => {
    if (this._entrySourceInfo?.initing) return;
    
    this._entrySourceInfo ??= {};
    this._entrySourceInfo.initing = true;
    this._entrySourceInfo.validres = new Map();
    this._entrySourceInfo.allRootPassed = true;

    try
    {
      // white list init entry tree and as mask
      if (this._entrySourceInfo.whiteList?.length)
      {
        const passKeys = new Set();
        for (const item of this._entrySourceInfo.whiteList.filter(a => !this._entrySourceInfo?.blackList?.includes(a)))
        {
          const queryAccessList = await this._queryEntrySource(item);
          if (queryAccessList && (!this._entrySourceInfo.root || queryAccessList.some(a => a.entry?.value == this._entrySourceInfo!.root)))
          {
            this._entrySourceInfo.rootEntry!.saveAccessList(queryAccessList);
            queryAccessList.filter(a => a.entry?.value).forEach(a => passKeys.add(a.entry!.value));
          }
        }

        // white list mask
        this._entrySourceInfo.rootEntry!.useWhiteList(Array.from(passKeys.values()));
      }

      // prepare entry tree and check single level
      const root = await this.getEntryAccessList();
      this._entrySourceInfo.singleLevel = !root[0]?.children?.length || root[0].children.every(a => !a.hasChildren);

      // load options to the value
      let value = this.getValue();
      if (!isEmpty(value))
      {
        if (!Array.isArray(value)) value = [value];
        for(const v of value as Array<any>)
          await this.getEntryAccessList(v);
      }

      // notify version change
      this._nextEntrySourceVer();
    }
    finally
    {
      this._entrySourceInfo.initing = false;
    }
  }

  /** next entry source version */
  private _nextEntrySourceVer() {
    if (!this._entrySourceInfo) return this.onNextProperty(EntrySourceVersion);
    const ver = (this._entrySourceInfo.version ?? 0) + 1;
    this._entrySourceInfo.version = ver;
    this.onNextProperty(EntrySourceVersion, ver, ver - 1);
  }

  /** debounce init options */
  private _delayInitEntryOptions = debounce(this._initEntryOptions, 50);

  /** query entry access list from entry source args */
  private _queryEntrySource = async (value: any): Promise<EntryAccess<any>[]> => {
    if (!this._entrySourceInfo?.source || !this._entrySourceInfo?.args) return [];

    // call entry source function
    const result = await this._entrySourceInfo.source.call(this._entrySourceInfo.args.map(a => {
        if (a.source) return a.source === this ? value : a.source.getValue();
        if (a.isroot) return this._entrySourceInfo!.root;
        return a.value;
      })) as EntryAccess<any>[];

    // valid
    if (this._entrySourceInfo.valids?.length || this._entrySourceInfo.blackList?.length)
    {
      // check black list for entry first
      if (this._entrySourceInfo.blackList?.length)
      {
        for (let i = 0; i < result.length; i++)
        {
          if (result[i].entry?.value && this._entrySourceInfo.blackList?.includes(`${result[i].entry?.value}`)) {
            result.splice(i);
            break;
          }
        }
      }

      // validate the children
      for (let i = result.length - 1; i >= 0; i--)
      {
        const r = result[i];
        if (r.children?.length) {
          const passed: Entry<any>[] = [];
          for (const c of r.children || [])
          {
            // black list not allow children
            if (this._entrySourceInfo.blackList?.includes(`${c.value}`)) continue;

            const disable = getPropertyValue(c, Disable) || !await this._isValidEntryValue(c.value);
            if (!disable || c.hasChildren) // valid or has children
            {
              if (disable) setPropertyValue(c, Disable, true); // mark as disabled
              passed.push(c);
            }
          }
          r.children = passed;
        }

        // rest hasChildren if no children passed
        if (!r.entry) continue;

        const disable = getPropertyValue(r.entry, Disable) || !await this._isValidEntryValue(r.entry.value);
        if (r.entry?.hasChildren && !r.children?.length) {
          r.entry.hasChildren = false;
          if (i > 0)
          {
            const item = result[i-1].children?.find(c => c.value == r.entry?.value);
            if (item) {
              if (disable)
                result[i-1].children?.splice(result[i-1].children?.indexOf(item)!, 1);
              else
                item.hasChildren = false;
            }
          }

          // may need reset the options, check the loaded options
          const entry = this._entrySourceInfo.rootEntry?.getEntry(r.entry.value);
          if (entry)
          {
            if (disable)
              entry.drop();
            else
              entry.dropChildren();
          }
        }
        else if (disable && this._entrySourceInfo.allRootPassed) {
          this._entrySourceInfo.allRootPassed = false;
          setTimeout(() => this._nextEntrySourceVer(), 0);
        }
      }

      // remove no children access
      for (let i = 0; i < result.length; i++)
      {
        if (!result[i].entry || result[i].entry?.hasChildren) continue;
        result.splice(i);
        break;
      }
    }
    return result;
  }

  /** check value value is valid */
  private _isValidEntryValue = async (value: any): Promise<boolean> => {
    const v = `${value}`;
    if (this._entrySourceInfo?.blackList?.includes(v)) return false;
    if (!this._entrySourceInfo?.valids?.length) return true;

    // check cache
    if (this._entrySourceInfo?.validres?.has(v)) return this._entrySourceInfo?.validres!.get(v)!;

    // valid
    let isvalid = true;
    for (const valid of this._entrySourceInfo.valids)
    {
      const res = await valid.func.call(valid.args.map(a => {
        if (!a.source) return a.value;
        return a.source === this ? value : a.source.getValue();
      }));
      if (!res)
      {
        isvalid = false;
        break;
      }
    }

    // validate access value type
    if (isvalid && this._entrySourceInfo?.valueTypeConsumer && this._entrySourceInfo.valueTypeProvider){
      const valueType = await this._entrySourceInfo.valueTypeProvider.call(this._entrySourceInfo.valueTypeProviderArgs!.map(a => {
        if (a.source) return a.source === this ? value : a.source.getValue();
        return a.value;
      })) as string;
      if (!valueType || !await this._entrySourceInfo.valueTypeConsumer.call(this._entrySourceInfo.valueTypeConsumerArgs!.map(a => {
        if (a.source) return a.source === this ? value : a.source.getValue();
        return a.value;
      }))) 
        isvalid = false;
    }

    // record cache
    this._entrySourceInfo.validres ??= new Map();
    this._entrySourceInfo.validres.set(v, isvalid);
    return isvalid;
  }

  /** query entry access list from entry source args */
  async getEntryAccessList(value?: any, root?: any): Promise<EntryAccess<any>[]> {
    if (!this._entrySourceInfo?.rootEntry) return [];
    let accessList = this._entrySourceInfo!.rootEntry.hasChildren ? this._entrySourceInfo!.rootEntry.getAccessList(value) : undefined;

    if (!accessList?.length && this._entrySourceInfo?.source && this._entrySourceInfo?.args) {
      // query access list
      accessList = await this._queryEntrySource(value);

      if (accessList?.length) {
        this._entrySourceInfo.rootEntry.saveAccessList(accessList);
        accessList = this._entrySourceInfo.rootEntry.getAccessList(value) ?? [];
      }
    }

    // check cascade level
    const cascade = this._entrySourceInfo?.cascade ?? 9999;
    if (accessList?.length && cascade <= accessList!.length)
    {
      accessList = accessList.slice(0, cascade);
      accessList[cascade - 1].children?.forEach(c => c.hasChildren = false);
    }

    // root
    if (root) {
      const index = accessList?.findIndex(a => a.entry?.value == root) ?? -1;
      if (index !== -1)
        accessList = accessList!.slice(0, index);
    }
    return accessList ?? [];
  }

  /** get entry access list from entry source args */
  getSubEntryList = async (value?: any): Promise<Entry<any>[]> => {
    const accessList = await this.getEntryAccessList(value);
    const last = accessList?.[accessList.length - 1];
    return last?.children ?? [];
  }

  // #endregion
}

/** The data node represents the object type */
export class AnyNode extends ScalarNode {}

// ── Utility ─────────────────────────────────────────────────

/** Entry source arg */
interface IEntrySourceArg
{
  source?: IValueAccess,
  value?: any,
  isroot?: boolean,
}

/** Entry source info */
interface IEntrySourceInfo
{
  /** The propert owner(the node or its ancestor) of the entry source */
  owner?: IValueAccess,
  
  /** The version of the entry source */
  version?: number,

  /** The source function */
  source?: FunctionType,

  /** The source args */
  args?: IEntrySourceArg[],

  /** The subscribes to other node */
  subscribes?: Function[],

  /** Whether only single level is used */
  singleLevel?: boolean,

  /** The cascade level */
  cascade?: number,

  /** The root value of starting */
  root?: string,

  /** Whether all root passed */
  allRootPassed?: boolean,

  /** The root entry */
  rootEntry?: EntryType<any>,

  /** The white list */
  whiteList?: string[],

  /** The black list */
  blackList?: string[],

  /** The valids */
  valids?: {
    prop: FuncCallProperty,
    func: FunctionType,
    args: IEntrySourceArg[],
  }[],

  /** The access value type provider */
  valueTypeProvider?: FunctionType,

  /** The access value type provider args */
  valueTypeProviderArgs?: IEntrySourceArg[],

  /** The access value type consumer */
  valueTypeConsumer?: FunctionType,

  /** The access value type consumer args */
  valueTypeConsumerArgs?: IEntrySourceArg[],

  /** The valid result cache */
  validres?: Map<string, boolean>,

  /** Whether initing */
  initing?: boolean,
}
