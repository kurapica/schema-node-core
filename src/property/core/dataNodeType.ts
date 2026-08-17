import { Property } from '../property';

import type { ValueAccessFactory } from '../../interface';

/** Declare the data node type */
export class DataNodeType extends Property<ValueAccessFactory> {}

/** Declare the array data node type */
export class ArrayDataNodeType extends Property<ValueAccessFactory> {}