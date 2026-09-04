import { Meta } from "../../../attribute/meta";
import { AccessPathHandler } from "../../../property/core/accessPath";
import { TypeProvider } from "../../../property/core/typeProvider";
import { getNodeType } from "../../../runtime";
import { TYPE_PROVIDER, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE } from "../../../utility";

import type { IValueAccess, IValueTypeAccess, IAccessPathHandler } from "../../../interface";

@Meta(AccessPathHandler, TYPE_PROVIDER)
class TypeProviderAccessPath implements IAccessPathHandler {
  private _valueType: IValueTypeAccess | undefined

  constructor() {
    setTimeout(async() => {
      // not really used, keep simple
      this._valueType = await getNodeType(NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE) as any as IValueTypeAccess;
    }, 0)
  }

  /** Get the access value type from the owner by path. */
  getAccessValueType(owner: IValueTypeAccess): IValueTypeAccess | undefined {
    return this._valueType;
  }

  /** Get the access value from the owner by path. */
  getAccessValue(owner: IValueAccess, node?: IValueAccess): IValueAccess | undefined {
    let access: IValueAccess | undefined = node ?? owner;
    while (access && !access.getProperty(TypeProvider)?.hasValue) access = access.parent;
    if (access) return access.getAccessValue(access.getPropertyValue<string>(TypeProvider)!, node);
  }
}