import type { IAccessPathHandler, IValueAccess, IValueTypeAccess } from "../../interface";
import { isEmpty, isNull } from "../../utility/toolset";
import { Property } from "../property";

const accessPathHandlers: Map<string, IAccessPathHandler> = new Map();

export class AccessPathHandler extends Property<string> {
  apply(target: object, field?: string | symbol, descriptorOrIndex?: number | TypedPropertyDescriptor<unknown>): void {
    if (!isNull(field) || !isNull(descriptorOrIndex)) return;
    const ctor = (typeof target === 'function' ? target : target.constructor) as new () => IAccessPathHandler;
    accessPathHandlers.set(this.getValue<string>()!.toLowerCase(), new ctor());
  }
}

/** Get the access value type from the owner by path. */
export function getGlobalAccessValueType(owner: IValueTypeAccess, path: string): IValueTypeAccess | undefined{
  const dotIdx = path.indexOf('.');
  const curr = dotIdx === -1 ? path : path.substring(0, dotIdx);
  const remain = dotIdx === -1 ? '' : path.substring(dotIdx + 1);
  const target = accessPathHandlers.get(curr.toLowerCase())?.getAccessValueType(owner);
  return !remain ? target : target?.getAccessValueType(remain);
}

/** Get the access value from the owner by path. */
export function getGlobalAccessValue(owner: IValueAccess, path: string, node?: IValueAccess): IValueAccess | undefined{
  const dotIdx = path.indexOf('.');
  const curr = dotIdx === -1 ? path : path.substring(0, dotIdx);
  const remain = dotIdx === -1 ? '' : path.substring(dotIdx + 1);
  const target = accessPathHandlers.get(curr.toLowerCase())?.getAccessValue(owner, node);
  return !remain ? target : target?.getAccessValue(remain);
}
