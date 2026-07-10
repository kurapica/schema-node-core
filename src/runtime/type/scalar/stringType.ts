import { ScalarType } from '../scalarType';
import { StringNode } from '../../../node/scalarNode';

export class StringType extends ScalarType {
  override create(): StringNode { return new StringNode(this); }
  override get isIndexable(): boolean { return true; }
}
