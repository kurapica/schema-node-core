import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, PropertyValueType } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_STRING } from '../../utility/constant';

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.indexes`)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
export class Indexes extends Property<string[][]> implements IConstraintProperty {
  validate(): boolean | undefined { return undefined; }
  validateAsync(): Promise<boolean | undefined> { return Promise.resolve(undefined); }
}
