import { Meta } from '../../attribute/meta';
import { ExpType } from '../../enum/expType';
import { OfSchema } from '../../property/core/ofSchema';
import { SchemaType } from '../../property/core/schemaType';
import { Return } from '../../property/function/return';
import { ArgName } from '../../property/function/argName';
import { Require } from '../../property/constraint/require';
import { Display } from '../../property/common/display';
import { getPropertyValue, setPropertyValue } from '../../property/propertyOwner';
import type { EntryAccess, Entry } from '../../struct/entry/type';
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_SCHEMA_REFLECT_FUNC, NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_FUNC_TYPE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_NODE_TYPE, NS_SYSTEM_ENTRYS, NS_SYSTEM_LIST, NS_SYSTEM_SCHEMA_FUNC, NS_SYSTEM_ENTRY_ACCESS, NS_SYSTEM_SCHEMA_REFLECT_STRUCT, NS_SYSTEM_SCHEMA_STRUCT, NS_SYSTEM_STRING } from '../../utility/constant';
import { _LS } from '../../utility/locale';
import { combinePaths } from '../../utility/toolset';
import { getNodeType } from '../../runtime/context';
import { FunctionType } from '../../schema/function/runtime';
import { ValueType } from '../../schema/value/runtime';
import { ArrayType } from '../../schema/array/runtime';
import type { FuncArg, FuncExp } from '../../schema/function/type';
import { BoolType } from '../../schema/bool';
import { IntType } from '../../schema/int/runtime';
import { DecimalType } from '../../schema/decimal/runtime';

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_REFLECT_FUNC)
export class SystemReflectFunction {
  /** Checks if the function type's return type match the given type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.withreturn`)
  @Meta(Return, NS_SYSTEM_BOOL)
  static async withreturn(
    @Meta(ArgName, 'func')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_FUNC_TYPE)
    @Meta(Require, true)
    func: string,

    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
    @Meta(Require, true)
    type: string,

    @Meta(ArgName, 'matchArrayElement')
    @Meta(SchemaType, NS_SYSTEM_BOOL)
    matchArrayElement: boolean = false,
  ): Promise<boolean> {
    const nodeType = !func ? undefined : await getNodeType(func) as FunctionType | undefined;
    const returnType = !type ? undefined : await getNodeType(type) as ValueType | undefined;
    if (!nodeType?.returnType || !returnType) return false;
    
    if (nodeType.returnType.isAssignableTo(returnType)) return true;
    
    if (matchArrayElement && returnType instanceof ArrayType && returnType.element) {
      return nodeType.returnType.isAssignableTo(returnType.element);
    }
    
    return false;
  }

  /** Checks if the function type's argument match the given types */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.withargs`)
  @Meta(Return, NS_SYSTEM_BOOL)
  static async withargs(
    @Meta(ArgName, 'func')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_TYPE)
    @Meta(Require, true)
    func: string,

    @Meta(ArgName, 'args')
    @Meta(SchemaType, `${NS_SYSTEM_ENTRYS}<${NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE}>`)
    args: string[],
  ): Promise<boolean> {
    const funcType = !func ? undefined : await getNodeType(func) as FunctionType | undefined;
    if (!funcType || args.length !== funcType.args.length) return false;
    
    for (let i = 0; i < args.length; i++) {
      const argType = !args[i] ? undefined : await getNodeType(args[i]) as ValueType | undefined;
      if (!argType) return false;
      
      const funcArgType = await getNodeType(funcType.args.get(i)!.type) as ValueType | undefined;
      if (!funcArgType || !funcArgType.isAssignableTo(argType)) return false;
    }
    
    return true;
  }

  /** Gets the sub entries of the struct fields */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.getaccessentries`)
  @Meta(Return, `${NS_SYSTEM_LIST}<${NS_SYSTEM_ENTRY_ACCESS}<${NS_SYSTEM_STRING}>>`)
  static async getaccessentries(
    @Meta(ArgName, 'args')
    @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.args`)
    @Meta(Require, true)
    args: FuncArg[],

    @Meta(ArgName, 'exps')
    @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.exps`)
    @Meta(Require, true)
    exps: FuncExp[],

    @Meta(ArgName, 'path')
    @Meta(SchemaType, NS_SYSTEM_STRING)
    path?: string,

    @Meta(ArgName, 'root')
    @Meta(SchemaType, NS_SYSTEM_STRING)
    root?: string
  ): Promise<EntryAccess<string>[]> {
    path = path?.toLowerCase() ?? '';
    root = root?.toLowerCase() ?? '';
    if (path && root && path !== root && !path.startsWith(`${root}.`)) return [];
    if (!root) root = path;

    // first
    const first: Entry<string>[] = [];
    let curr: Entry<string> | undefined;
    let valueType: ValueType | undefined;

    // args
    for (let a of args)
    {
      if (!a.name || !a.type) continue;
      const ftype = await getNodeType(a.type) as ValueType;
      if (!ftype) continue;
      const entry: Entry<string> = { value: a.name, hasChildren: ftype.hasAccessEntries };
      setPropertyValue(entry, Display, getPropertyValue(a, Display) ?? _LS(a.name));
      first.push(entry);
      if (!curr && path && (path === a.name.toLowerCase() || path.startsWith(`${a.name.toLowerCase()}.`))) {
        curr = entry;
        valueType = ftype;
      }
    }

    // exps
    for(let e of exps)
    {
      if (!e.name || !e.return) continue;
      const ftype = await getNodeType(e.return) as ValueType;
      if (!ftype) continue;
      const entry: Entry<string> = { value: e.name, hasChildren: ftype.hasAccessEntries };
      setPropertyValue(entry, Display, getPropertyValue(e, Display) ?? _LS(e.name));
      first.push(entry);
      if (!curr && path && (path === e.name.toLowerCase() || path.startsWith(`${e.name.toLowerCase()}.`))) {
        curr = entry;
        valueType = ftype;
      }
    }

    const result: EntryAccess<string>[] = [ { children: first} ];
    while (valueType)
    {
      const accessEntry: EntryAccess<string> = {};
      const accesses = valueType.getAccessEntries();
      if (curr)
      {
        accessEntry.entry = setPropertyValue(
          { value: curr.value, hasChildren: accesses.length > 0 },
          Display,
          getPropertyValue(curr, Display)
        );
      }
      accessEntry.children = accesses;

      // check next part
      let next: ValueType | undefined;
      for (const a of accesses)
      {
        const n = a.value;
        if (curr) a.value = combinePaths(curr.value, n);
        if (path && (path === a.value || path.startsWith(a.value + '.')))
        {
          next = valueType.getAccessValueType(n);
          curr = a;
        }
      }
      result.push(accessEntry);
      valueType = next;
    }

    // cut
    return root ? result.filter(e => (e.entry?.value?.length ?? 0) < root.length) : result;
  }

  /** Gets the value type of the struct field */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_STRUCT}.getaccessvaluetype`)
  @Meta(Return, NS_SYSTEM_STRING)
  static async getaccessvaluetype(
    @Meta(ArgName, 'args')
    @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.args`)
    @Meta(Require, true)
    args: FuncArg[],

    @Meta(ArgName, 'exps')
    @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.exps`)
    @Meta(Require, true)
    exps: FuncExp[],

    @Meta(ArgName, 'path')
    @Meta(SchemaType, NS_SYSTEM_STRING)
    path: string
  ): Promise<string | undefined> {
    path = path.toLowerCase();
    if (!path) return undefined;
    const dotIndex = path.indexOf('.');
    const fieldName = dotIndex === -1 ? path : path.substring(0, dotIndex);
    const type = args.find(a => a.name.toLowerCase() === fieldName)?.type ?? exps.find(e => e.name.toLowerCase() === fieldName)?.return;
    const valueType = type ? await getNodeType(type) as ValueType : undefined;
    return dotIndex === -1 ? valueType?.name : valueType?.getAccessValueType(path.substring(dotIndex + 1))?.name;
  }

  /** Get the exp types for the given retunr type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.getexptypes`)
  @Meta(Return, `${NS_SYSTEM_LIST}<${NS_SYSTEM_SCHEMA_FUNC}.exptype>`)
  static async getexptypes(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
    @Meta(Require, true)
    type: string
  ): Promise<ExpType[]> {
    var returnType = type ? await getNodeType(type) as ValueType : undefined;
    if (!returnType) return [];
    if (returnType instanceof ArrayType) return [ExpType.Call, ExpType.Filter, ExpType.Map];
    if (returnType instanceof BoolType) return [ExpType.Call, ExpType.All, ExpType.Any];
    if (returnType instanceof IntType) return [ExpType.Call, ExpType.Count, ExpType.Reduce];
    if (returnType instanceof DecimalType) return [ExpType.Call, ExpType.Reduce];
    return [ExpType.Call, ExpType.First, ExpType.Last, ExpType.Reduce];
  }

  /** Get the expected function return type for the given exp return type */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.getexpectreturn`)
  @Meta(Return, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  static async getexpectreturn(
    @Meta(ArgName, 'type')
    @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
    @Meta(Require, true)
    type: string,

    @Meta(ArgName, 'expType')
    @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.exptype`)
    expType: ExpType,
  ): Promise<string | undefined> {
    const valueType = !type ? undefined : await getNodeType(type) as ValueType | undefined;
    if (!valueType) return undefined;
    switch(expType){
      case ExpType.Call:
      case ExpType.Reduce:
        return valueType.name;
      case ExpType.Map:
        return valueType instanceof ArrayType ? valueType.element?.name : valueType.name;
      case ExpType.First:
      case ExpType.Last:
      case ExpType.Filter:
      case ExpType.Count:
      case ExpType.All:
      case ExpType.Any:
        return NS_SYSTEM_BOOL;
      default:
        return undefined;
    }
  }
}
