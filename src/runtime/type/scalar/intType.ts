import { ScalarType } from '../scalarType';
import { IntNode } from '../../../node/scalarNode';
import type { NodeSchema } from '../../../schema/nodeSchema';

export class IntType extends ScalarType {
  override create(): IntNode { return new IntNode(this.schema); }
  override get isIndexable(): boolean { return true; }
}
