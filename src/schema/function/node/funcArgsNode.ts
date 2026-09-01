import { InVisible } from "../../../property/common/invisible";
import { ArrayNodeTemplate } from "../../array/node";
import { MaxSize } from "../../array/property/maxSize";
import { MinSize } from "../../array/property/minSize";
import { FuncArgNode } from "./funcArgNode";

import type { ArrayType } from "../../array/runtime";
import type { BoolNode } from "../../bool";
import type { IPropertyProvider, IValueAccess } from "../../../interface";

/** The function arguments node */
export class FuncArgsNode extends ArrayNodeTemplate<FuncArgNode>
{
  constructor(type: ArrayType, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, value, parent, propProvider);

    // variadic arguments are the last
    this.recordSubscription(this.subscribeItem(() => {
      for (let i = 0; i < this.length - 1; i++)
      {
        const variadic = this._elements[i].getAccessValue('variadic') as BoolNode;
        variadic.value = false;
        variadic.setPropertyValue(InVisible, true, this);
      }
      if (this.length > 0)
      {
        const variadic = this._elements[this.length - 1].getAccessValue('variadic') as BoolNode;
        variadic.setPropertyValue(InVisible, undefined, this);
      }
    }, true));
  }

  /** The arguments are unmodifiable. */
  set unModifiable(value: boolean) {
    this.setPropertyValue(MinSize, value ? this.length : undefined);
    this.setPropertyValue(MaxSize, value ? this.length : undefined);
    this.forEach((item: FuncArgNode) => item.unModifiable = value);
  }
}