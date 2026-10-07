import { StructNode } from "../../struct/node";
import { FuncArgType } from "../runtime";

import type { IValueTypeAccess, IValueAccess, IPropertyProvider } from "../../../interface";
import type { DataNode } from "../../value/node";

/** Function call argument node */
export class FuncCallArgNode extends StructNode {
  constructor(type: IValueTypeAccess, value: unknown, parent?: IValueAccess, ...propProviders: IPropertyProvider[]) {
    super(type, value, parent, ...propProviders);

    const valueNode = this.getAccessValue('value') as DataNode;
    valueNode.addPropertyProvider(propProviders.find(provider => provider instanceof FuncArgType));
  }
}