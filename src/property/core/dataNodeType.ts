import { Property } from '../property';
import { DataNode } from '../../node/dataNode';
import { IValueAccess } from '../../runtime/interface/valueAccess';
import { IPropertyProvider } from '../../runtime/interface/propertyProvider';
import { ValueType } from '../../runtime/type/valueType';

/** Declare the data node type */
export class DataNodeType extends Property<new (type: ValueType, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) => DataNode> {}