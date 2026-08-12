import { LowLimitString } from "../../property/constraint/lowLimit";
import { UpLimitString } from "../../property/constraint/upLimit";
import { isNull } from "../../utility/toolset";
import { ScalarNode } from "../object/node";

/** The data node represents the string node */
export class StringNode extends ScalarNode {
  override getValue() {
    let value = this._value;
    if (isNull(value)) return null;
    return `${value instanceof Date ? value.toISOString() : typeof (value) === "object" ? JSON.stringify(value) : value}`
  }

  /** The uplimit of string */
  get upLimit(): number | undefined { return this.getPropertyValue(UpLimitString) as number }

  /** The lowlimit of string */
  get lowLimit(): number | undefined { return this.getPropertyValue(LowLimitString) as number }
}