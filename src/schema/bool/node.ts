import { isNull } from "../../utility/toolset";
import { ScalarNode } from "../object/node";

/** The data node represents the bool node */
export class BoolNode extends ScalarNode {
  override getValue() {
    let value = this._value;
    if (typeof (value) === "string") value = value.toLowerCase() === "true"
    if (!isNull(value)) value = value ? true : false
    return value;
  }
}