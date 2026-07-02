import { ScalarType } from '../scalarType';
import { NumericNode } from '../../../node/scalarNode';
import type { NodeSchema } from '../../../schema/nodeSchema';

export class DecimalType extends ScalarType {
  override create(): NumericNode { return new NumericNode(this.schema); }
}
