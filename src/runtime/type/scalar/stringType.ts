import { ScalarType } from '../scalarType';
import { StringNode } from '../../../node/scalarNode';
import type { NodeSchema } from '../../../schema/nodeSchema';

export class StringType extends ScalarType {
  override create(): StringNode { return new StringNode(this.schema); }
  override get isIndexable(): boolean { return true; }
}
