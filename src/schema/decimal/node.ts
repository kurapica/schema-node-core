import { LowLimitNumber } from "../../property/constraint/lowLimit";
import { UpLimitNumber } from "../../property/constraint/upLimit";
import { isNull } from "../../utility/toolset";
import { ScalarNode } from "../object/node";

export class DecimalNode extends ScalarNode {
  override getValue() {
    let value = this._value;
    if (isNull(value)) return null;
    if (typeof value === 'string') value = parseFloat(value);
    return Number.isFinite(value) ? value : null;
  }

  /** The uplimit of numeric */
  get upLimit(): number | undefined { return this.getPropertyValue(UpLimitNumber) as number }

  /** The lowlimit of numeric */
  get lowLimit(): number | undefined { return this.getPropertyValue(LowLimitNumber) as number }
}