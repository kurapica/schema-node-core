import { MaxSize, MinSize } from "../../../property/constraint/size";
import { ArrayNodeTemplate } from "../../array/node";
import { FuncArgNode } from "./funcArgNode";

/** The function arguments node */
export class FuncArgsNode extends ArrayNodeTemplate<FuncArgNode>
{
  /** The arguments are unmodifiable. */
  set unModifiable(value: boolean) {
    this.setPropertyValue(MinSize, value ? this.length : undefined);
    this.setPropertyValue(MaxSize, value ? this.length : undefined);
    this.forEach((item: FuncArgNode) => item.unModifiable = value);
  }
}