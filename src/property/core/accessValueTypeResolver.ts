import { AccessValueTypeProvider, Property } from "..";
import { Meta, Relation } from "../../attribute";
import { Assign } from "../../relation";
import { FunctionType, getNodeType, getSchemaKindPropertyTypes, IValueAccess } from "../../runtime";
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_SCHEMA_PROPERTY, NS_SYSTEM_SCHEMA_REFLECT_FUNC, NODE_SELF, NS_SYSTEM_LIST, NS_SYSTEM_ENTRY_ACCESS, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_STRING } from "../../utility";
import { ReadOnly, InVisible, Default } from "../common";
import { Valid } from "../constraint";
import { buildFuncCall, FuncCall, FuncCallProperty } from "../funcCallProperty";
import { OfSchema } from "./ofSchema";
import { PropertyValueType } from "./propertyValueType";
import { SchemaType } from "./schemaType";
import { Static } from "./static";

/** The access value provider property */
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.AccessValueTypeResolver`)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
@Relation(Valid, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.withreturn`, NODE_SELF, NS_SYSTEM_STRING), "@AccessValueTypeResolver.func")
export class AccessValueTypeResolver extends Property<string> {
  effect(target: IValueAccess, newValue?: unknown, oldValue?: unknown, source?: IValueAccess): void {
    if (!newValue || !this._value) return; // static only effect once
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
  }
}