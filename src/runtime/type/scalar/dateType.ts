import { ScalarType } from '../scalarType';
import { DateNode } from '../../../node/scalarNode';

export class DateType extends ScalarType {
  override create(): DateNode { return new DateNode(this); }
  override get isIndexable(): boolean { return true; }
}
