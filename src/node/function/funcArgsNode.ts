import { MaxSize, MinSize, ReadOnly } from "../../property";
import { ArrayNodeTemplate } from "../arrayNode";
import { FuncArgNode } from "./funcArgNode";

/** The function arguments node */
export class FuncArgsNode extends ArrayNodeTemplate<FuncArgNode>
{
  /** The arguments are unmodifiable. */
  set unmodifiable(value: boolean) {
    if (value)
    {
      this.setPropertyValue(MinSize, this.length);
      this.setPropertyValue(MaxSize, this.length);
      this.forEach((item: FuncArgNode) =>{
        item.argName.setPropertyValue(ReadOnly, true, this);
        item.argType.setPropertyValue(ReadOnly, true, this);
      })
    }
    else
    {
      this.setPropertyValue(MinSize, undefined);
      this.setPropertyValue(MaxSize, undefined);
      this.forEach((item: FuncArgNode) =>{
        item.argName.setPropertyValue(ReadOnly, undefined, this);
        item.argType.setPropertyValue(ReadOnly, undefined, this);
      })
    }
  }
}