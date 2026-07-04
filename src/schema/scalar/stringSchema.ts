import { ScalarSchema } from './scalarSchema';

export interface StringSchema extends ScalarSchema {
  regex?: string;
  lowLimit?: number;
  upLimit?: number;
}
