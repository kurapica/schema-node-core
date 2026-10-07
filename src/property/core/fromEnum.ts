import { Meta } from '../../attribute/meta';
import { Alias } from './alias';
import { Property } from '../property';

/** Binding enum with enum schema type */
@Meta(Alias, 'fromEnum')
export class FromEnum extends Property<object> {}