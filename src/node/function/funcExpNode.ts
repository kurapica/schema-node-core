import { StructNode } from "..";
import { ExpType } from "../../enum";
import { InVisible, Variadic } from "../../property";
import { StructType, IValueAccess, IPropertyProvider, ArrayType, FunctionType, getNodeType } from "../../runtime";
import { FuncExp, CallArg } from "../../schema";
import { ArrayNode } from "../arrayNode";
import { DataNode } from "../dataNode";
import { EnumNode } from "../enumNode";
import { StringNode } from "../scalarNode";
import { FuncExpArgNode } from "./funcExpArgNode";
import { FuncExpArgsNode } from "./funcExpArgsNode";


/** The expression node contains the expression definition, used to apply the relations from the function argument */
export class FuncExpNode extends StructNode
{
  // #region ── ctor & dtor ───────────────────────────────────────────────────

  /** The expression name */
  readonly expName: StringNode;

  /** The return type */
  readonly return: StringNode;

  /** The expression type */
  readonly expType: EnumNode;

  /** The function */
  readonly func: StringNode;

  /** The arguments */
  readonly args: FuncExpArgsNode;

  constructor(type: StructType, value: FuncExp | undefined, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, undefined, parent, propProvider);
    value ??= { name: "", return: "", type: ExpType.Call, func: "", args: [] };
    
    this.expName = this.getAccessValue("name") as StringNode;
    this.return = this.getAccessValue("return") as StringNode;
    this.expType = this.getAccessValue("type") as EnumNode;
    this.func = this.getAccessValue("func") as StringNode;
    this.args = this.getAccessValue("args") as FuncExpArgsNode;
    
    this.recordSubscription(this.return.subscribe(this.refreshFunc));
    this.recordSubscription(this.expType.subscribe(this.refreshFunc));
    this.recordSubscription(this.func.subscribe(this.refreshFunc));
    this.refreshFunc();
  }
  // #endregion

  // #region ── Implementation ────────────────────────────────────────────────

  override dispose(): void {
    this.args.forEach(arg => arg.dispose());
    super.dispose();
  }

  override getValue(): unknown {
    const data: any = super.getValue();
    return {
      ...data,
      args: this.args.map(arg => arg.value),
    }
  }

  override get isEmpty(): boolean { return super.isEmpty && this.args.length === 0; }

  override get changed(): boolean { return super.changed || this.args.some(arg => arg.changed); }
  
  override confirm(): void {
    this.args.forEach(arg => arg.confirm());
    super.confirm();
  }
  // #endregion

  // #region ── Utility ─────────────────────────────────────────────────────────
  private _funcType: FunctionType | undefined;
  private _expType: string | undefined;
  private _returnType: string | undefined;
  private _argType: StructType;
  private _initData?: CallArg[];

  private async refreshFunc(){
    const returnType = this.return.value as string;
    const expType = this.expType.value as string;
    const func = this.func.value as string;

    if (this._expType !== expType || this._returnType !== returnType) {
      this._expType = expType;
      this._returnType = returnType;

      // return type & exp type is required
      if (!returnType || !expType) {
        this._funcType = undefined;
        this.func.setPropertyValue(InVisible, true, this);
        this.resizeArgs(0);
        return;
      }
    }

    // check function type
    const funcType = func ? await getNodeType(func) as FunctionType : undefined;
    if (funcType === this._funcType) return;
    this._funcType = funcType;

    if (!funcType) {
      this.resizeArgs(0);
      return;
    }

    const generics = funcType.generics;
    const arglength = funcType.args.length;
    const isInitData = this._initData !== undefined;
    const argValues = this._initData ?? this.args.map(arg => arg.value) ?? [];
    delete this._initData;

    const isVariadic = (arglength && funcType.args[arglength - 1].getPropertyValue<boolean>(Variadic)) ?? false;
    if (!isVariadic) this.resizeArgs(arglength);

    // update arguments
    for (let i = 0; i < (isVariadic ? Math.max(arglength, argValues.length) : arglength); i++)
    {
      const argType = i < arglength ? funcType.args[i] : funcType.args[arglength - 1];
      let argNode = this.args[i];
      if (!argNode) {
        argNode = this._argType.create(argValues[i], this, argType);
        this.args.push(argNode);
      }
      else if (argNode.propertyProvider !== argType)
      {
        argNode = this._argType.create(argValues[i], this, argType);
        this.args[i] = argNode;
      }
      else 
      {
        argNode.value = argValues[i];
      }

      if (isInitData)
        argNode.confirm();
    }
  }

  private resizeArgs(maxLength: number)
  {
    while (this.args.length > maxLength)
      this.args.pop()?.dispose();
  }

  //#endregion
}