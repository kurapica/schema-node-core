import { ReadOnly } from "../../property";
import { StructType, IValueAccess, IPropertyProvider, getNodeType, FunctionType } from "../../runtime";
import { FunctionSchema } from "../../schema";
import { ArrayNode } from "../arrayNode";
import { DataNode } from "../dataNode";
import { StringNode } from "../scalarNode";
import { FuncArgsNode } from "./funcArgsNode";
import { FuncExpNode } from "./funcExpNode";

/** The function node contains the function definition */
export class FunctionNode extends DataNode
{
  /** The return type */
  readonly return: StringNode;

  /** The arguments */
  readonly args: FuncArgsNode;

  /** The expressions */
  readonly exps: FuncExpNode[];

  constructor(type: StructType, value: FunctionSchema | undefined, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, undefined, parent, propProvider);

    value ??= { return: "", args: [], exps: [] };
    const returnField = type.getField("return")!;
    const argsField = type.getField("args")!;
    const expsField = type.getField("exps")!;

    this.return = returnField.type!.create(value.return, this, returnField) as StringNode;
    this.args = new FuncArgsNode(argsField.type!, value.args ?? [], this, argsField);
    this.exps = value.exps.map((exp) => new FuncExpNode(expsField.type!, exp, this, expsField));
    
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