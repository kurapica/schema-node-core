import { Property } from "..";
import { DataNode } from "../../node";
import { ValueType, IValueAccess, IPropertyProvider } from "../../runtime";

/** Declare the data node type */
export class DataNodeType extends Property<new (type: ValueType, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) => DataNode> {}