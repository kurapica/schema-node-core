import { ScalarType } from '../scalarType';
import { NumericNode } from '../../../node/scalarNode';

export class DecimalType extends ScalarType {
  override create(): NumericNode { return new NumericNode(this); }
}
