import { ScalarType } from '../scalarType';
import { BoolNode } from '../../../node/scalarNode';
import { IValueAccess } from '../../interfaces';

export class BoolType extends ScalarType {
  override create(value: unknown, parent?: IValueAccess): BoolNode { return new BoolNode(this, value, parent); }
  override get isIndexable(): boolean { return true; }
}
