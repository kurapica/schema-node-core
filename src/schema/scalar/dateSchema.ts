import { ScalarSchema } from './scalarSchema';

export class DateSchema extends ScalarSchema {
  lowLimit?: string;
  upLimit?: string;
}
