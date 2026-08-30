import { deepClone, isEmpty } from "../../utility/toolset";
import { FunctionType } from "../../schema/function/runtime";
import { getPropertyValue } from "../../property/propertyOwner";
import { getNodeType } from "../../runtime/context";

import type { IRelationProcess } from "../../schema/relation/interface";
import type { IErrorProvider, IValueAccess, IRelation } from "../../interface";
import type { CallArg } from "../../schema/function/type";
import type { RelationSchema } from "../../schema/relation/type";
import type { FuncCall } from '../../schema/function/type';
import { logger } from "../../utility/logger";

/** The call relation process */
export class CallProcess implements IRelationProcess, IErrorProvider {
  /** The function call settings */
  private _call?: FuncCall;
  private _error?: string;
  private _func?: FunctionType;

  /** The function */
  get func() { return this._func }

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
      if (!node) {
        console.warn('[Relation][Call][Attach]', owner, a.source, 'not found');
        return;
      }
      node.subscribe(handler);
      target.recordSubscription(node.subscribe(handler), relation);
    });

    handler();
  }

  detach(relation: IRelation, owner: IValueAccess, target: IValueAccess): void {
    target.clearSubscription(relation);
  }

  async process(owner: IValueAccess, target: IValueAccess): Promise<unknown> {
    if (!this._func) return undefined;
    try
    {
      return await this._func.call(this._call!.args.map(a => {
        if (isEmpty(a.source)) return a.value;
        const node = owner.getAccessValue(a.source!, target);
        return node?.getValue();
      }), this._call?.mode);
    }
    catch (error)
    {
      logger.error('[CallProcess]', owner, this._call, error);
      return undefined;
    }
  }
}