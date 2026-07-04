import { ScalarSchema } from './scalarSchema';

export interface IntSchema extends ScalarSchema {
  lowLimit?: number;
  upLimit?: number;
}
