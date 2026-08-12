import { LowLimitInt } from "../../property/constraint/lowLimit";
import { UpLimitInt } from "../../property/constraint/upLimit";
import { isNull } from "../../utility/toolset";
import { ScalarNode } from "../object/node";

/** The int node represents the int node */
export class IntNode extends ScalarNode {
  override getValue() {
    let value = this._value;
    if (isNull(value)) return null;
    if (typeof value === 'string') value = parseInt(value);
    return Number.isFinite(value) ? value : null;
  }

  /** The uplimit of int */
  get upLimit(): number | undefined { return this.getPropertyValue(UpLimitInt) as number }

  /** The lowlimit of int */
  get lowLimit(): number | undefined { return this.getPropertyValue(LowLimitInt) as number }
}