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
  private _showVariadic = true;

  constructor(type: ArrayType, value: unknown, parent?: IValueAccess, ...propProviders: IPropertyProvider[]) {
    super(type, value, parent, ...propProviders);

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
        variadic.setPropertyValue(InVisible, !this._showVariadic, this);
      }
    }, true));
  }

  /** The arguments are unmodifiable. */
  set unModifiable(value: boolean) {
    this.setPropertyValue(MinSize, value ? this.length : undefined);
    this.setPropertyValue(MaxSize, value ? this.length : undefined);
    this.forEach((item: FuncArgNode) => item.unModifiable = value);
  }

  set showVariadic(value: boolean) {
    this._showVariadic = value;
    if (!this._elements.length) return;
    this._elements[this._elements.length - 1].getAccessValue('variadic')?.setPropertyValue(InVisible, !value);
  }
}