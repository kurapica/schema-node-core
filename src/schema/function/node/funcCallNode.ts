import { getNodeType } from "../../../runtime/context";
import { EnumNode } from "../../enum/node";
import { StringNode } from "../../string/node";
import { StructNode } from "../../struct/node";
import { StructType } from "../../struct/runtime";
import { FunctionType } from "../runtime";

import type { IPropertyProvider, IValueAccess } from "../../../interface";
import type { FuncExp } from "../type";
import type { FuncCallArgsNode } from "./funcCallArgsNode";
import type { ApplyMode } from "../../../enum/applyMode/type";

/** The expression node contains the expression definition, used to apply the relations from the function argument */
export class FuncCallNode extends StructNode
{
  // #region ── ctor & dtor ───────────────────────────────────────────────────

  /** The apply mode */
  readonly mode: EnumNode;

  /** The function */
  readonly func: StringNode;

  /** The arguments */
  readonly args: FuncCallArgsNode;

  constructor(type: StructType, value: FuncExp | undefined, parent?: IValueAccess, ...propProviders: IPropertyProvider[]) {
    super(type, value, parent, ...propProviders);
    this.mode = this.getAccessValue("mode") as EnumNode;
    this.func = this.getAccessValue("func") as StringNode;
    this.args = this.getAccessValue("args") as FuncCallArgsNode;

    this.recordSubscription(this.mode.subscribe(this.refreshExpArgs));
    this.recordSubscription(this.func.subscribe(this.refreshExpArgs, true));
  }

  // #endregion

  // #region ── Utility ─────────────────────────────────────────────────────────

  private refreshExpArgs = async () => {
    const func = this.func.value as string;
    const funcType = func ? await getNodeType(func) as FunctionType : undefined;
    this.args.refreshFuncCall(this.mode.value as ApplyMode, funcType);
  }

  //#endregion
}