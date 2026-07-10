import { ScalarType } from '../scalarType';
import { BoolNode } from '../../../node/scalarNode';

export class BoolType extends ScalarType {
  override create(): BoolNode { return new BoolNode(this as unknown as ValueType); }
  get isIndexable(): boolean { return true; }
}
