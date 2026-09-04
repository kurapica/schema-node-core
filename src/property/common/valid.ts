import { FuncCallProperty } from '../funcCallProperty';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { Stackable } from '../core/stackable';
import { getNodeType } from '../../runtime/context';
import { isEmpty, isNull } from '../../utility/toolset';
import { Error } from '../common/error';
import { StructNode } from '../../schema/struct/node';
import { FunctionType } from '../../schema/function/runtime';
import { getErrorMessage } from '../constraintProperty';
import { Assign } from '../../relation/assign';
import { Default } from '../common/default';
import { Relation } from '../../attribute/relation';
import { logger } from '../../utility/logger';

import type { IConstraintProperty, IValueAccess } from '../../interface';
import type { FuncCall } from '../../schema/function/type';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_COMMON, NS_SYSTEM_SCHEMA_FUNC, NS_SYSTEM_BOOL } from '../../utility/constant';

/** The valid constraint. Check if the node is valid. If not, return the error message. */
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_COMMON}.valid`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_FUNC}.funccall`)
@Meta(Stackable, true)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PRO_COMMON}.valid.error`)
@Relation(Default, Assign, NS_SYSTEM_BOOL, 'valid.return')
export class Valid extends FuncCallProperty implements IConstraintProperty {
  effect(target: IValueAccess, newValue?: unknown, oldValue?: unknown, source?: IValueAccess): void {
    this.clear(target, source);
    if ((newValue as FuncCall).args?.length) {
      source ??= this.source ?? target;
      for (let arg of (newValue as FuncCall).args) {
        if (arg.source) {
          const t = source?.getAccessValue(arg.source!, target);
          if (t)
            target.recordSubscription(t.subscribe(async () => {
              const res = await t.getValue();
              target.setPropertyValue(Valid, res as boolean, source);
            }), this);
        }
      }
    }
  }

  clear(target: IValueAccess, source?: IValueAccess): void {
    target.clearSubscription(this);
  }

  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value?.func) return undefined;
    if (!(node instanceof StructNode) && isNull(node.getValue())) return undefined;
    
    const func = await getNodeType(this._value.func) as FunctionType;
    if (!func) {
      console.error(`Valid property function ${this._value.func} is not a function type`);
      return undefined;
    }
    const owner = this.source ?? node;
    try
    {
      return await func.call(this._value!.args.map(a => {
        if (isEmpty(a.source)) return a.value;
        const source = owner?.getAccessValue(a.source!, node);
        return source?.getValue();
      })) as boolean;
    }
    catch (error)
    {
      logger.error('[Valid]', node, this._value, error);
      return undefined;
    }
  }

  error(node: IValueAccess): string | undefined {
    return getErrorMessage(this, node);
  }
}
