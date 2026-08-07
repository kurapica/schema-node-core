import { FunctionType, getNodeType, IPropertyProvider, IValueAccess, StructType } from "../runtime";
import { FunctionSchema } from "../schema";
import { ArrayNode } from "./arrayNode";
import { DataNode } from "./dataNode";
import { StringNode } from "./scalarNode";
import { StructNode } from "./structNode";

/** The function node contains the function definition */
export class FunctionNode extends DataNode
{
  private _isUsed: boolean = false;

  /** The return type */
  readonly return: StringNode;

  /** The arguments */
  readonly args: StructNode[];

  /** The expressions */
  readonly exps: StructNode[];

  /** Whether the function is used */
  get isUsed() { return this._isUsed; }

  constructor(type: StructType, value: FunctionSchema | undefined, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, undefined, parent, propProvider);

    const returnField = type.getField("return")!;
    this.return = returnField.type!.create(undefined, this, returnField) as StringNode;
    this.args = [];
    this.exps = [];

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
      this._isUsed = funcType?.isUsed ?? false;

      // 

      this.return.setValue(funcName);
    }
  }

}