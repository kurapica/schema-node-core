import { Meta } from '../../attribute/meta';
import { Alias } from './alias';
import { Property } from '../property';

/** The base type of the scalar schema type */
@Meta(Alias, 'base')
export class Base extends Property<string> {}