import { debounce, deepClone, isEmpty } from "../../utility/toolset";
import { FunctionType } from "../../schema/function/runtime";
import { getPropertyValue } from "../../property/propertyOwner";
import { getNodeType } from "../../runtime/context";
import { logger } from "../../utility/logger";

import type { IRelationProcess } from "../../schema/relation/interface";
import type { IErrorProvider, IValueAccess, IRelation } from "../../interface";
import type { CallArg } from "../../schema/function/type";
import type { RelationSchema } from "../../schema/relation/type";
import type { FuncCall } from '../../schema/function/type';
import type { ApplyMode } from "../../enum";

import { DEBOUNCE_TIME } from "../../utility/constant";

/** The any relation process */
export class AnyProcess implements IRelationProcess, IErrorProvider {
  /** The function call settings */
  private _error?: string;

  private _funcCalls: {
    func: FunctionType;
    args: CallArg[];
    mode: ApplyMode;
  }[] = [];

  /** The error */
  get error() { return this._error }

  async load(schema: RelationSchema) {
    const calls = getPropertyValue<FuncCall[]>(schema, 'any') ?? [];
    for (const call of calls) {
      if (isEmpty(call.func)) continue;
      const func = await getNodeType(call.func) as FunctionType;
      if (!func){
        this._error = 'RELATION_FUNC_NOT_EXIST'; // @TODO: handle error later
        return;
      }
      this._funcCalls.push({
        func,
        args: deepClone(call.args || []),
        mode: call.mode || 'call',
      });
    }
  }

  attach(relation: IRelation, owner: IValueAccess, target: IValueAccess): void {
    if (this._error) return;
    const handler = debounce(async (): Promise<void> => await relation.process(owner, target), DEBOUNCE_TIME);

    // Subscribe the source node for data changes
    for (const call of this._funcCalls) {
      call.args.forEach(a => {
        if (isEmpty(a.source)) return;
        const node = owner.getAccessValue(a.source!, target);
        if (!node) {
          logger.warn('[Relation][Any][Attach]', owner, target, a.source, 'not found');
          return;
        }
        target.recordSubscription(node.subscribe(handler), relation);
      });
    }
  }

  detach(relation: IRelation, owner: IValueAccess, target: IValueAccess): void {
    target.clearSubscription(relation);
  }

  async process(owner: IValueAccess, target: IValueAccess): Promise<unknown> {
    if (this._error || !this._funcCalls.length) return undefined;
    try
    {
      for (const call of this._funcCalls) {
        if (await call.func.call(call.args.map(a => {
          if (isEmpty(a.source)) return a.value;
          const node = owner.getAccessValue(a.source!, target);
          return node?.getValue();
        }) ?? [], call.mode, owner)) return true;
      }
      return false;
    }
    catch (error)
    {
      logger.error('[CallProcess]', owner, this._funcCalls, error);
      return undefined;
    }
  }
}