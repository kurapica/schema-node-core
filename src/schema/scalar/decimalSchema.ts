import { ScalarSchema } from './scalarSchema';

export interface DecimalSchema extends ScalarSchema {
  lowLimit?: number;
  upLimit?: number;
}
