import { ScalarType } from '../scalarType';
import { AnyNode } from '../../../node/scalarNode';

export class ObjectType extends ScalarType {
  override create(): AnyNode { return new AnyNode(this); }
}
