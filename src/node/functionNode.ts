import { InVisible, ReadOnly, Variadic } from "../property";
import { ArrayType, FunctionType, getNodeType, IPropertyProvider, IValueAccess, StructType } from "../runtime";
import { CallArg, FuncExp, FunctionSchema } from "../schema";
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

/** The function expression arguments data node */
export class FunExpArgsNode extends StructNode implements Iterable<IValueAccess> {
  // #region ── ctor & dtor ───────────────────────────────────────────────────

  /** The arguments */
  readonly args: DataNode[];

  constructor(type: FunctionType, value: CallArg[] | unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    // construct temp struct type

    super(type, undefined, parent, propProvider);
    this.args = [];
  }
  // #endregion

  // #region ── Value Access ──────────────────────────────────────────────────

  // #endregion

  // #region ── Iterable ──────────────────────────────────────────────────────
  /** The iterator for the arguments */
  [Symbol.iterator](): Iterator<IValueAccess> {
    return this.args[Symbol.iterator]();
  }

  forEach(callback: (value: IValueAccess, index: number) => void): void {
    this._fields.forEach(callback);
  }

  map<T>(callback: (value: IValueAccess, index: number) => T): T[] {
    return this._fields.map(callback);
  }

  // #endregion
}

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
  readonly args: DataNode[];

  constructor(type: StructType, value: FuncExp | undefined, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    const { args, ...rest } = value || {};
    super(type, rest, parent, propProvider);
    
    const arrayNode = super.getAccessValue("args") as ArrayNode;
    this._fields.splice(this._fields.indexOf(arrayNode), 1); // Remove the args field

    this._argType = (type.getField("args")!.type as ArrayType)!.element as StructType;
    this._initData = (Array.isArray(args) ? args : []) as CallArg[];

    this.expName = this.getAccessValue("name") as StringNode;
    this.return = this.getAccessValue("return") as StringNode;
    this.expType = this.getAccessValue("type") as EnumNode;
    this.func = this.getAccessValue("func") as StringNode;
    this.args = [];
    
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