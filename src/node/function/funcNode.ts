import { ArrayNodeTemplate, StructNode } from "..";
import { Immutable, ReadOnly } from "../../property";
import { StructType, IValueAccess, IPropertyProvider, getNodeType, FunctionType, ArrayType } from "../../runtime";
import { FunctionSchema } from "../../schema";
import { DataNode } from "../dataNode";
import { StringNode } from "../scalarNode";
import { FuncArgsNode } from "./funcArgsNode";
import { FuncExpNode } from "./funcExpNode";

/** The function node contains the function definition */
export class FunctionNode extends StructNode
{
  // #region ── ctor & dtor ───────────────────────────────────────────────────

  /** The return type */
  readonly return: StringNode;

  /** The arguments */
  readonly args: FuncArgsNode;

  /** The expressions */
  readonly exps: ArrayNodeTemplate<FuncExpNode>;

  constructor(type: StructType, value: FunctionSchema | undefined, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, undefined, parent, propProvider);

    value ??= { return: "", args: [], exps: [] };
    const returnField = type.getField("return")!;
    const argsField = type.getField("args")!;
    const expsField = type.getField("exps")!;

    this.return = returnField.type!.create(value.return, this, returnField) as StringNode;
    this.args = new FuncArgsNode(argsField.type!, value.args ?? [], this, argsField);
    this.exps = value.exps.map((exp) => new FuncExpNode((expsField.type as ArrayType)!.element!, exp, this, expsField));
    
    // The function fields are standalone nodes, we can init them asynchronously
    if (value.return)
    {
      const ns = this.parent?.getAccessValue("namespace")?.getValue() as string;
      const name = this.parent?.getAccessValue("name")?.getValue() as string;
      const funcName = ns ? `${ns}.${name}` : name;
      if (funcName) {
        getNodeType(funcName).then((type) => {
          if (type instanceof FunctionType && type.isUsed) {
            this.return.setPropertyValue(ReadOnly, true, this);
            this.args.unmodifiable = true;
          }
        });
      }
    }
  }

  override dispose(): void {
    this.return.dispose();
    this.args.dispose();
    this.exps.forEach((exp) => exp.dispose());
    super.dispose();
  }

  override getValue(): unknown {
    return {
      return: this.return.getValue(),
      args: this.args.getValue(),
      exps: this.exps.map((exp) => exp.getValue()),
    }
  }

  override get isEmpty(): boolean {
    return this.return.isEmpty && this.args.isEmpty && !this.exps.length;
  }

  override get changed(): boolean {
    return this.return.changed || this.args.changed || this.exps.some((exp) => exp.changed);
  }

  override confirm(): void {
    this.return.confirm();
    this.args.confirm();
    this.exps.forEach((exp) => exp.confirm());
    super.confirm();
  }

  override get isValid(): boolean {
    return this.return.isValid && this.args.isValid && this.exps.every((exp) => exp.isValid);
  }

  // #endregion
}