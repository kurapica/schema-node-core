import { Property } from '../property';
import type { IConstraintProperty } from '../constraintProperty';

export interface Entry<T> { value: T; display?: string; }

export class StringEntries extends Property<Entry<string>[]> implements IConstraintProperty {
  validateString(): boolean | undefined { return undefined; }
  validate(): boolean | undefined { return undefined; }
  validateAsync(): Promise<boolean | undefined> { return Promise.resolve(undefined); }
}

export class IntEntries extends Property<Entry<number>[]> implements IConstraintProperty {
  validateInt(): boolean | undefined { return undefined; }
  validate(): boolean | undefined { return undefined; }
  validateAsync(): Promise<boolean | undefined> { return Promise.resolve(undefined); }
}
