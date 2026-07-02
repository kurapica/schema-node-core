import { ScalarType } from '../scalarType';
import { BoolNode } from '../../../node/scalarNode';
import type { NodeSchema } from '../../../schema/nodeSchema';

export class BoolType extends ScalarType {
  override create(): BoolNode { return new BoolNode(this.schema); }
  override get isIndexable(): boolean { return true; }
}
