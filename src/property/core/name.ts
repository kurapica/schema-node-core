import { Meta } from '../../attribute/meta';
import { Alias } from './alias';
import { Property } from '../property';

/** The name property for struct field */
@Meta(Alias, 'name')
export class Name extends Property<string>{}