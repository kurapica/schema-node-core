import { ScalarSchema } from './scalarSchema';

export class DecimalSchema extends ScalarSchema {
  lowLimit?: number;
  upLimit?: number;
}
