import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, PropertyValueType } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_ENUM, SCHEMA_KIND_INT, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_ENTRY } from '../../utility/constant';

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(ForSchema, [SCHEMA_KIND_ENUM, SCHEMA_KIND_INT, SCHEMA_KIND_STRING])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.blacklist`)
@Meta(PropertyValueType, NS_SYSTEM_ENTRY)
export class BlackList extends Property<unknown[]> implements IConstraintProperty {
  validateEnum(): boolean | undefined { return undefined; }
  validateInt(): boolean | undefined { return undefined; }
  validateString(): boolean | undefined { return undefined; }
  validate(): boolean | undefined { return undefined; }
  validateAsync(): Promise<boolean | undefined> { return Promise.resolve(undefined); }
}
