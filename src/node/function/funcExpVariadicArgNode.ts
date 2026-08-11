import { IValueAccess } from '../../runtime/interface/valueAccess';
import { IPropertyProvider } from '../../runtime/interface/propertyProvider';
import { CallArg } from '../../schema/functionSchema';
import { ArrayNodeTemplate } from "../arrayNode";
import { FuncExpArgNode } from "./funcExpArgNode";
import { ValueType } from '../../runtime/type/valueType';
import { StructType } from '../../runtime/type/structType';

export class FuncExpVariadicArgNode extends ArrayNodeTemplate<FuncExpArgNode> {
  constructor(type: ValueType, value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider) {
    super(type as StructType, value as CallArg | undefined, parent, propProvider);
  }
}