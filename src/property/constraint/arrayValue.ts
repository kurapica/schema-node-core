import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, PropertyValueType, Alias, ForSchema, InVisible, Default, Static } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, SCHEMA_KIND_ARRAY, NS_SYSTEM_BOOL } from '../../utility/constant';

@Meta(Alias, 'array')
@Meta(ForSchema, [SCHEMA_KIND_ARRAY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.array`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(InVisible, true)
@Meta(Default, true)
@Meta(Static, true)
export class ArrayValue extends Property<boolean> implements IConstraintProperty {
  override get hasValue(): boolean { return true; }
}
