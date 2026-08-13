import { deepClone, isEmpty } from "../../utility/toolset";
import { FunctionType } from "../../schema/function/runtime";
import { getPropertyValue } from "../../property/propertyOwner";
import { getNodeType } from "../../runtime/context";
import { RelationStage } from "../../enum/relationStage";

import type { IRelationProcess } from "../../schema/relation/interface";
import type { IErrorProvider, IValueAccess, IRelation } from "../../interface";
import type { CallArg } from "../../schema/function/type";
import type { RelationSchema } from "../../schema/relation/type";
import type { FuncCall } from '../../schema/function/type';

/** The call relation process */
export class CallProcess implements IRelationProcess, IErrorProvider {
  /** The function call settings */
  private _call?: FuncCall;
  private _error?: string;
  private _func?: FunctionType;

  /** The arguments */
  get args(): CallArg[] { return deepClone(this._call?.args || []); }

  /** The error */
  get error() { return this._error }

  async load(schema: RelationSchema) {
    this._call = getPropertyValue<FuncCall>(schema, 'call');
    this._func = this._call?.func ? await getNodeType(this._call.func) as FunctionType : undefined;
    if (!this._func)
      this._error = 'RELATION_FUNC_NOT_EXIST'; // @TODO: handle error later
  }

  attach(relation: IRelation, owner: IValueAccess, target: IValueAccess): void {
    if (!this._func) return;
    const handler = () => relation.process(owner, target);

    // Subscribe the source node for data changes
    this._call!.args.forEach(a => {
      if (isEmpty(a.source)) return;
      const node = owner.getAccessValue(a.source!, target);
      if (!node) return;
      target.recordSubscription(node.subscribe(handler), relation);
    });

    // Load stage: call the function immediately
    if (relation.stage & RelationStage.Load)
      handler();
  }

  detach(relation: IRelation, owner: IValueAccess, target: IValueAccess): void {
    target.clearSubscription(relation);
  }

  async process(owner: IValueAccess, target: IValueAccess): Promise<unknown> {
    if (!this._func) return undefined;
    return await this._func.call(this._call!.args.map(a => {
      if (isEmpty(a.source)) return a.value;
      const node = owner.getAccessValue(a.source!, target);
      return node?.getValue();
    }));
  }
}