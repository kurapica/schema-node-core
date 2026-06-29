import { ScalarSchema } from './scalarSchema';

export class IntSchema extends ScalarSchema {
  lowLimit?: number;
  upLimit?: number;
}
