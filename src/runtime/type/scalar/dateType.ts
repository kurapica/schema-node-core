import { ScalarType } from '../scalarType';
import { DateNode } from '../../../node/scalarNode';
import type { NodeSchema } from '../../../schema/nodeSchema';

export class DateType extends ScalarType {
  override create(): DateNode { return new DateNode(this.schema); }
  override get isIndexable(): boolean { return true; }
}
