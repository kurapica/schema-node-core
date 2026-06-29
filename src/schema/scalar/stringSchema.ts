import { ScalarSchema } from './scalarSchema';

export class StringSchema extends ScalarSchema {
  regex?: string;
  lowLimit?: number;
  upLimit?: number;
}
