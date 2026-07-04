import { ScalarSchema } from './scalarSchema';

export interface DateSchema extends ScalarSchema {
  lowLimit?: string;
  upLimit?: string;
}
