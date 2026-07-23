import { ScalarType } from '../scalarType';
import { AnyNode } from '../../../node/scalarNode';
import { IPropertyProvider, IValueAccess } from '../../interfaces';

export class ObjectType extends ScalarType {
  override create(value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider): AnyNode { return new AnyNode(this, value, parent, propProvider); }
}
