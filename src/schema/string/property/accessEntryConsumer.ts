import { Meta } from '../../../attribute/meta';
import { ReadOnly } from '../../../property/common/readOnly';
import { InVisible } from '../../../property/common/invisible';
import { FuncCallProperty } from '../../../property/funcCallProperty';
import { type FuncCall } from '../../../schema/function/type';
import { ForSchema } from '../../../property/core/forSchema';
import { OfSchema } from '../../../property/core/ofSchema';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { SchemaType } from '../../../property/core/schemaType';
import { Static } from '../../../property/core/static';
import { Error } from '../../../property/common/error';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_STRING, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_FUNC, NS_SYSTEM_SCHEMA_PRO_COMMON, NS_SYSTEM_SCHEMA_FUNC_CALL } from '../../../utility/constant';
import type { IConstraintProperty, IValueAccess, IValueTypeAccess } from '../../../interface';
import type { FunctionType } from '../../function/runtime';
import { getNodeType } from '../../../runtime/context';
import { isEmpty } from '../../../utility/toolset';
import { logger } from '../../../utility/logger';
import { getErrorMessage } from '../../../property/constraintProperty';
import { AccessValueTypeProvider } from '../../../property/core/accessValueTypeProvider';
import type { ValueType } from '../../value';

/** The access value consumer property */
@Meta(ForSchema, [SCHEMA_KIND_STRING])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_STRING}.AccessEntryConsumer`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_FUNC_CALL}<${NS_SYSTEM_SCHEMA_FUNC}.valid>`)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PRO_COMMON}.valid.error`)
export class AccessEntryConsumer extends FuncCallProperty implements IConstraintProperty {
  effect(target: IValueAccess): void {
    this.clear(target);

    if (this._value?.args?.length) {
      const source = this.source ?? target;
      for (let arg of this._value!.args) {
        if (arg.source) {
          const t = source?.getAccessValue(arg.source!, target);
          if (t && t !== target) 
            target.recordSubscription(t.subscribe(async () => {
              const res = await this.validate(target) as boolean;
              target.recordConstraint(this, res); 
            }), this);
        }
      }
    }
  }

  clear(target: IValueAccess): void {
    target.clearSubscription(this);
  }

  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value?.func) return undefined;

    // gets the access value type provier
    let parent: IValueAccess | undefined = node;
    let valueType: IValueTypeAccess | undefined = undefined;
    while (parent){
      const provider = parent.getProperty(AccessValueTypeProvider);
      if (provider?.hasValue) {
        const funcCall = provider.getValue<FuncCall>();
        if (funcCall?.func) {
          const typeFunc = await getNodeType(funcCall.func) as FunctionType;
          const type = await typeFunc.call((funcCall.args ?? []).map(a => {
            if (a.source) return (provider.source ?? node).getAccessValue(a.source!, node)?.getValue();
            return a.value;
          })) as string;
          valueType = type ? await getNodeType(type) as ValueType : undefined;
          break;
        }
      }
      parent = parent.parent;
    }
    if (!valueType) return undefined;
    
    const func = await getNodeType(this._value.func) as FunctionType;
    if (!func) {
      logger.error(`Valid property function ${this._value.func} is not a function type`);
      return undefined;
    }
    const owner = this.source ?? node;
    try
    {
      const res =  await func.call(this._value!.args.map(a => {
        if (isEmpty(a.source)) return a.value;
        const source = owner?.getAccessValue(a.source!, node);
        return source == node ? valueType?.name : source?.getValue();
      })) as boolean;
      return res;
    }
    catch (error)
    {
      logger.error('[AccessEntryConsumer]', node, this._value, error);
      return undefined;
    }
  }

  error(node: IValueAccess): string | undefined {
    return getErrorMessage(this, node);
  }
}

