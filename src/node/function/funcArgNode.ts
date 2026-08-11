import { BoolNode, StringNode } from '../scalarNode';
import { StructNode } from '../structNode';
import { ReadOnly } from '../../property/common/readOnly';
import { IValueAccess } from '../../runtime/interface/valueAccess';
import { IPropertyProvider } from '../../runtime/interface/propertyProvider';
import { FuncArg } from '../../schema/functionSchema';
import { StructType } from '../../runtime/type/structType';

/** The function argument node */
export class FuncArgNode extends StructNode
{
  /** The argument name. */
  readonly argName: StringNode;

  /** The argument type. */
  readonly argType: StringNode;

  /** The argument is required. */
  readonly argRequire: BoolNode;

  /** The argument is variadic. */
  readonly argVariadic: BoolNode;

  constructor(type: StructType, value: FuncArg | undefined, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type, value, parent, propProvider);

    this.argName = this.getAccessValue("name") as StringNode;
    this.argType = this.getAccessValue("type") as StringNode;
    this.argRequire = this.getAccessValue("require") as BoolNode;
    this.argVariadic = this.getAccessValue("variadic") as BoolNode;
  }

  /** The arguments are unmodifiable. */
  set unModifiable(value: boolean) {
    this.argName.setPropertyValue(ReadOnly, value ? true : undefined, this.parent);
    this.argType.setPropertyValue(ReadOnly, value ? true : undefined, this.parent);
    this.argRequire.setPropertyValue(ReadOnly, value ? true : undefined, this.parent);
    this.argVariadic.setPropertyValue(ReadOnly, value ? true : undefined, this.parent);
  }
}