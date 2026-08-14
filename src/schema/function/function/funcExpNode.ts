import { ExpType } from "../../../enum/expType/type";
import { getNodeType } from "../../../runtime/context";
import { EnumNode } from "../../enum/node";
import { StringNode } from "../../string/node";
import { StructNode } from "../../struct/node";
import { StructType } from "../../struct/runtime";
import { FunctionType } from "../runtime";
import { FuncExpArgsNode } from "./funcExpArgsNode";

import type { IPropertyProvider, IValueAccess } from "../../../interface";
import type { FuncExp } from "../type";

/** The expression node contains the expression definition, used to apply the relations from the function argument */
export class FuncExpNode extends StructNode
{
  // #region ── ctor & dtor ───────────────────────────────────────────────────

  /** The expression name */
  readonly expName: StringNode;

  /** The return type */
  readonly expReturn: StringNode;

  /** The expression type */
  readonly expType: EnumNode;

  /** The function */
  readonly expFunc: StringNode;

  /** The arguments */
  readonly expArgs: FuncExpArgsNode;

  constructor(type: StructType, value: FuncExp | undefined, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, value, parent, propProvider);

    this.expName = this.getAccessValue("name") as StringNode;
    this.expReturn = this.getAccessValue("return") as StringNode;
    this.expType = this.getAccessValue("type") as EnumNode;
    this.expFunc = this.getAccessValue("func") as StringNode;
    this.expArgs = this.getAccessValue("args") as FuncExpArgsNode;

    this.recordSubscription(this.expType.subscribe(this.refreshExpArgs));
    this.recordSubscription(this.expFunc.subscribe(this.refreshExpArgs));
    this.refreshExpArgs();
  }

  // #endregion

  // #region ── Utility ─────────────────────────────────────────────────────────

  private async refreshExpArgs() {
    const func = this.expFunc.value as string;
    const funcType = func ? await getNodeType(func) as FunctionType : undefined;
    this.expArgs.refreshFuncCall(this.expType.value as ExpType, funcType);
  }

  //#endregion
}