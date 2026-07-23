import { ScalarType } from '../scalarType';
import { BoolNode } from '../../../node/scalarNode';
import { IPropertyProvider, IValueAccess } from '../../interfaces';

export class BoolType extends ScalarType {
  override create(value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider): BoolNode { return new BoolNode(this, value, parent, propProvider); }
  override get isIndexable(): boolean { return true; }
}
