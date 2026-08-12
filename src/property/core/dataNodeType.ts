import type { IPropertyProvider } from '../../interface/propertyProvider';
import type { IValueAccess } from '../../interface/valueAccess';
import type { DataNode } from '../../schema/value/node';
import type { ValueType } from '../../schema/value/runtime';
import { Property } from '../property';

/** Declare the data node type */
export class DataNodeType extends Property<new (type: ValueType, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) => DataNode> {}