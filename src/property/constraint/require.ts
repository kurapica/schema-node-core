import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, PropertyValueType } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_BOOL } from '../../utility/constant';

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.require`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class Require extends Property<boolean> implements IConstraintProperty {
  validate(): boolean | undefined {
    return !this._hasValue || this._value !== true ? undefined : undefined;
  }
  validateAsync(): Promise<boolean | undefined> { return Promise.resolve(this.validate()); }
}
