import { Meta } from "../../../attribute/meta";
import type { IValueAccess, IValueTypeAccess, IAccessPathHandler } from "../../../interface";
import { AccessPathHandler } from "../../../property/core/accessPath";
import { NODE_SELF } from "../../../utility";

@Meta(AccessPathHandler, NODE_SELF)
class SelfAccessPath implements IAccessPathHandler {
  /** Get the access value type from the owner by path. */
  getAccessValueType(owner: IValueTypeAccess): IValueTypeAccess | undefined {
    return owner;
  }

  /** Get the access value from the owner by path. */
  getAccessValue(owner: IValueAccess, node?: IValueAccess): IValueAccess | undefined {
    return node ?? owner;
  }
}