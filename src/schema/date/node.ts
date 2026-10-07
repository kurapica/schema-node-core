import { LowLimitDate } from "./property/lowLimit";
import { UpLimitDate } from "./property/upLimit";
import { parseDate } from "../../utility/toolset";
import { ScalarNode } from "../object/node";

export class DateNode extends ScalarNode {
  override getValue(){ return parseDate(this.rawValue); }

  /** The uplimit of numeric */
  get upLimit(): Date | undefined { return parseDate(this.getPropertyValue(UpLimitDate)) }

  /** The lowlimit of numeric */
  get lowLimit(): Date | undefined { return parseDate(this.getPropertyValue(LowLimitDate)) }
}
