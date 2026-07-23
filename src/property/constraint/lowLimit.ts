import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, PropertyValueType, Alias } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_INT, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_INT } from '../../utility/constant';

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(ForSchema, [SCHEMA_KIND_INT])
@Meta(Alias, 'lowlimit')
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.lowlimit`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
export class LowLimitInt extends Property<number> implements IConstraintProperty {
  validateInt(): boolean | undefined { return undefined; }
  validate(): boolean | undefined { return undefined; }
  validateAsync(): Promise<boolean | undefined> { return Promise.resolve(undefined); }
}

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.lowlimit`)
@Meta(PropertyValueType, NS_SYSTEM_NUMBER)
export class LowLimitNumber extends Property<number> implements IConstraintProperty {
  validateNumeric(): boolean | undefined { return undefined; }
  validate(): boolean | undefined { return undefined; }
  validateAsync(): Promise<boolean | undefined> { return Promise.resolve(undefined); }
}

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.lowlimit`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
export class LowLimitString extends Property<number> implements IConstraintProperty {
  validateString(): boolean | undefined { return undefined; }
  validate(): boolean | undefined { return undefined; }
  validateAsync(): Promise<boolean | undefined> { return Promise.resolve(undefined); }
}

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.lowlimit`)
@Meta(PropertyValueType, NS_SYSTEM_DATE)
export class LowLimitDate extends Property<number> implements IConstraintProperty {
  validateDate(): boolean | undefined { return undefined; }
  validate(): boolean | undefined { return undefined; }
  validateAsync(): Promise<boolean | undefined> { return Promise.resolve(undefined); }
}
