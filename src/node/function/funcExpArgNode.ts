import { StringNode } from '../scalarNode';
import { StructNode } from '../structNode';
import { IValueAccess } from '../../runtime/interface/valueAccess';
import { IPropertyProvider } from '../../runtime/interface/propertyProvider';
import { ValueType } from '../../runtime/type/valueType';
import { StructType } from '../../runtime/type/structType';

export class FuncExpArgNode extends StructNode {
  /** The argument type. */
  readonly argType: StringNode;

  /** The argument source. */
  readonly argSource: StringNode;

  constructor(type: ValueType, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type as StructType, value, parent, propProvider);

    this.argType = this.getAccessValue("type") as StringNode;
    this.argSource = this.getAccessValue("source") as StringNode;
  }
}