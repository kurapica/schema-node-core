import { Meta } from '../../../attribute/meta';
import { Relation } from '../../../attribute/relation';
import { ReadOnly } from '../../../property/common/readOnly';
import { InVisible } from '../../../property/common/invisible';
import { Default } from '../../../property/common/default';
import { Valid } from '../../../property/common/valid';
import { buildFuncCall } from '../../../schema/function/type';
import { getNodeType } from '../../../runtime/context';
import { FunctionType } from '../../../schema/function/runtime';
import { ForSchema } from '../../../property/core/forSchema';
import { OfSchema } from '../../../property/core/ofSchema';
import { SchemaType } from '../../../property/core/schemaType';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { Static } from '../../../property/core/static';
import { Property } from '../../../property/property';
import { AccessValueTypeProvider } from '../../../property/core/accessValueTypeProvider';

import type { FuncCall } from '../../../schema/function/type';
import type { IValueAccess } from '../../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_REFLECT_FUNC, NODE_SELF, NS_SYSTEM_STRING, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_PRO_STRING } from '../../../utility/constant';

/** The access value provider property */
@Meta(ForSchema, [SCHEMA_KIND_STRING])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_STRING}.AccessValueTypeResolver`)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
@Relation(Valid,'assign', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.withreturn`, NODE_SELF, NS_SYSTEM_STRING), "accessValueTypeResolver.func")
export class AccessValueTypeResolver extends Property<string> {
  effect(target: IValueAccess, newValue?: unknown, oldValue?: unknown, source?: IValueAccess): void {
    if (!newValue || !this._value) return; // static only effect once
    setTimeout(() => {
      let provider: IValueAccess | undefined = target;

      // find the access value provider
      while (provider)
      {
        const accessProvider = provider.getPropertyValue<FuncCall>(AccessValueTypeProvider);
        if (accessProvider?.func) {
          // the acces value type resolve
          const resolve = async () => {
            const func = await getNodeType(accessProvider.func) as FunctionType;
            let value = await func?.call(accessProvider.args.map(a => {
              if (!a.source) return a.value;
              if (a.source === NODE_SELF) return target.parent?.getAccessValue(this._value!)?.rawValue;
              return provider?.getAccessValue(a.source)?.rawValue;
            }));
            target.setPropertyValue(Default, value, provider);
          }

          // subscribe the access value provider
          accessProvider.args.forEach(a => {
            if (!a.source) return;
            const node = a.source == NODE_SELF 
            ? target.parent?.getAccessValue(this._value!) 
            : provider?.getAccessValue(a.source);
            if (node)
              target.recordSubscription(node.subscribe(resolve), target);
          });

          // resolve the access value type
          resolve();

          break;
        }
        provider = provider.parent;
      }
    }, 0);
  }
}