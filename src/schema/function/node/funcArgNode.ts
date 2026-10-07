import { ReadOnly } from "../../../property/common/readOnly";
import { StructNode } from "../../struct/node";

/** The function argument node */
export class FuncArgNode extends StructNode
{
  /** The arguments are unmodifiable. */
  set unModifiable(value: boolean) {
    this.getAccessValue("name")?.setPropertyValue(ReadOnly, value ? true : undefined, this.parent);
    this.getAccessValue("type")?.setPropertyValue(ReadOnly, value ? true : undefined, this.parent);
    this.getAccessValue("argDefine.require")?.setPropertyValue(ReadOnly, value ? true : undefined, this.parent);
    this.getAccessValue("argDefine.variadic")?.setPropertyValue(ReadOnly, value ? true : undefined, this.parent);
  }
}