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

  private async refreshFunc(){
    const returnType = this.return.value;
    const expType = this.expType.value;
    const func = this.func.value;
    if (!returnType || !expType) {
      this.func.setPropertyValue(InVisible, true, this);
      this.args.splice(0, this.args.length);
    }
  }
}