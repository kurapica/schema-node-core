import { ReadOnly } from "../../../property/common/readOnly";
import { getNodeType } from "../../../runtime/context";
import { StringNode } from "../../string/node";
import { StructNode } from "../../struct/node";
import { StructType } from "../../struct/runtime";
import { FunctionType } from "../runtime";
import { FuncArgsNode } from "./funcArgsNode";

import type { IPropertyProvider, IValueAccess } from "../../../interface";
import type { FunctionSchema } from "../type";
import type { ArrayNode } from "../../array/node";
import type { DataNode } from "../../value";
import { SchemaLoadState } from "../../../enum";
import { getSystemSchema } from "../../../runtime";
import { ARRAY_ELEMENT, NS_SYSTEM_SCHEMA_PRO_COMMON } from "../../../utility/constant";
import { RelationType } from "../../relation/runtime";
import type { RelationSchema } from "../../relation/type";

/** The function node contains the function definition */
export class FunctionNode extends StructNode
{
  // #region ── ctor & dtor ───────────────────────────────────────────────────

  /** The return type */
  readonly return: StringNode;

  /** The arguments */
  readonly args: FuncArgsNode;

  /** The expressions */
  readonly exps: ArrayNode;

  readonly others: DataNode[];

  constructor(type: StructType, value: FunctionSchema | undefined, parent?: IValueAccess, ...propProviders: IPropertyProvider[]) {
    super(type, value, parent, ...propProviders);

    this.return = this.getAccessValue("return") as StringNode;
    this.args   = this.getAccessValue("args") as FuncArgsNode;
    this.exps   = this.getAccessValue("exps") as ArrayNode;
    this.others = Array.from(this.fields).filter((f) => f.name != "return" && f.name != "args" && f.name != "exps");

    const ns  = this.parent?.getAccessValue("namespace");
    const name= this.parent?.getAccessValue("name");
    if (ns && name) {
      this.recordSubscription(ns.subscribe(this._refreshState));
      this.recordSubscription(name.subscribe(this._refreshState));
    }
  }

  private _refreshState = async () => {
    const ns  = this.parent?.getAccessValue("namespace")?.getValue() as string;
    const name= this.parent?.getAccessValue("name")?.getValue() as string;
    const funcName = ns ? `${ns}.${name}` : name;

    const schema = funcName ? getSystemSchema(funcName) : undefined;

    // variadic only for system function
    this.args.showVariadic = ((schema?.loadState ?? 0) & SchemaLoadState.System) > 0;

    // check if the function is used, return and arg type are immutable if used
    // we do it without using relations, because it's a common case in execution part, no need to flood the function schema
    const nodeType = funcName ? await getNodeType(funcName) : undefined;
    if (nodeType instanceof FunctionType && nodeType.isUsed)
    {
      this.return.setPropertyValue(ReadOnly, true, this);
      this.args.unModifiable = true;
    }
  }
}