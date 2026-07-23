import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, PropertyValueType } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_STRING } from '../../utility/constant';
import { IValueAccess } from '../../runtime/interfaces';

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.indexes`)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
export class Indexes extends Property<DataIndex[]> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    return undefined; // do nothing
  }
}

/** A named index definition with ordered fields. */
export interface DataIndex {
  name: string;
  fields: string[];
  isUnique?: boolean;
}
