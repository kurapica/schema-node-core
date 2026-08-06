import { Meta } from "../../attribute";
import { ExpType } from "../../enum";
import { OfSchema, SchemaType, Return, ArgName, Require } from "../../property";
import { getNodeType, FunctionType, ValueType, ArrayType, DecimalType, BoolType, IntType } from "../../runtime";
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_SCHEMA_REFLECT_FUNC, NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_FUNC_TYPE, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_NODE_TYPE, NS_SYSTEM_ENTRYS, NS_SYSTEM_LIST, NS_SYSTEM_SCHEMA_FUNC } from "../../utility";

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
      
      const funcArgType = await getNodeType(funcType.args[i].type) as ValueType | undefined;
      if (!funcArgType || !funcArgType.isAssignableTo(argType)) return false;
    }
    
    return true;
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
