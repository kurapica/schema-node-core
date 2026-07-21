import { ScalarType } from '../scalarType';
import { AnyNode } from '../../../node/scalarNode';
import { IValueAccess } from '../../interfaces';

export class ObjectType extends ScalarType {
  override create(value: unknown, parent?: IValueAccess): AnyNode { return new AnyNode(this, value, parent); }
}
