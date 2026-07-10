import { ScalarType } from '../scalarType';
import { IntNode } from '../../../node/scalarNode';

export class IntType extends ScalarType {
  override create(): IntNode { return new IntNode(this); }
  override get isIndexable(): boolean { return true; }
}
