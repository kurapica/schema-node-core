import { InVisible, ReadOnly } from "../property";
import { FunctionType, getNodeType, IPropertyProvider, IValueAccess, StructType } from "../runtime";
import { FuncExp, FunctionSchema } from "../schema";
import { ArrayNode } from "./arrayNode";
import { DataNode } from "./dataNode";
import { EnumNode } from "./enumNode";
import { StringNode } from "./scalarNode";
import { StructNode } from "./structNode";

/** The function node contains the function definition */
export class FunctionNode extends StructNode
{
  /** The return type */
  readonly return: StringNode;

  /** The arguments */
  readonly args: ArrayNode;

  /** The expressions */
  readonly exps: ArrayNode;

  constructor(type: StructType, value: FunctionSchema | undefined, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    const { exps, ...rest } = value || {};
    super(type, rest, parent, propProvider);

    this.return = this.getAccessValue("return") as StringNode;
    this.args = this.getAccessValue("args") as ArrayNode;
    this.exps = this.getAccessValue("exps") as ArrayNode;

    // The function fields are standalone nodes, we can init them asynchronously
    this.init(value);
  }

  /** Initialize the function node */
  private async init(schema: FunctionSchema | undefined) {
    if (schema)
    {
      const ns = this.parent?.getAccessValue("namespace")?.getValue() as string;
      const name = this.parent?.getAccessValue("name")?.getValue() as string;
      const funcName = ns ? `${ns}.${name}` : name;
      const funcType = await getNodeType(funcName) as FunctionType;

      if (funcType?.isUsed)
      {
        this.return.setPropertyValue(ReadOnly, true, this);
        this.args.setPropertyValue(ReadOnly, true, this);
      }
    }
  }
}

/** The expression node contains the expression definition, used to apply the relations from the function argument */
export class FuncExpNode extends StructNode
{
  /** The expression name */
  readonly expName: StringNode;

  /** The return type */
  readonly return: StringNode;

  /** The expression type */
  readonly expType: EnumNode;

  /** The function */
  readonly func: StringNode;

  /** The arguments */
  readonly args: DataNode[];

  constructor(type: StructType, value: FuncExp | undefined, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, value, parent, propProvider);
    const argsArray = this._fields.pop() as ArrayNode; // Remove the args field

    this.expName = this.getAccessValue("name") as StringNode;
    this.return = this.getAccessValue("return") as StringNode;
    this.expType = this.getAccessValue("type") as EnumNode;
    this.func = this.getAccessValue("func") as StringNode;
    this.args = Array.from(argsArray.elements);
    
    this.recordSubscription(this.return.subscribe(this.refreshFunc));
    this.recordSubscription(this.expType.subscribe(this.refreshFunc));
    this.recordSubscription(this.func.subscribe(this.refreshFunc));
    this.refreshFunc();
  }

  // #region ── Utility ─────────────────────────────────────────────────────────
  private _funcType: FunctionType | undefined;
  private _expType: string | undefined;
  private _returnType: string | undefined;

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
    if (arglength !== this.args.length)
      this.resizeArgs(arglength);
  }

  private resizeArgs(maxLength: number)
  {
    while (this.args.length > maxLength)
      this.args.pop()?.dispose();
  }

  //#endregion
}