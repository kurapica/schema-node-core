import { ScalarType } from '../scalarType';
import { AnyNode } from '../../../node/scalarNode';
import type { NodeSchema } from '../../../schema/nodeSchema';

export class ObjectType extends ScalarType {
  override create(): AnyNode { return new AnyNode(this.schema); }
}
