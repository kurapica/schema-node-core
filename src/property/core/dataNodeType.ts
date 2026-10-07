import { Meta } from '../../attribute/meta';
import { Alias } from './alias';
import { Property } from '../property';

import type { ValueAccessFactory } from '../../interface';

/** Declare the data node type */
@Meta(Alias, 'dataNodeType')
export class DataNodeType extends Property<ValueAccessFactory> {}

/** Declare the array data node type */
@Meta(Alias, 'arrayDataNodeType')
export class ArrayDataNodeType extends Property<ValueAccessFactory> {}