import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, PropertyValueType } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_ENUM, SCHEMA_KIND_INT, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_ENTRY } from '../../utility/constant';
import { IValueAccess } from '../../runtime/interfaces';
import { Error } from '../common';

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(ForSchema, [SCHEMA_KIND_ENUM, SCHEMA_KIND_INT, SCHEMA_KIND_STRING])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.blacklist`)
@Meta(PropertyValueType, NS_SYSTEM_ENTRY)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.blacklist.error`)
export class BlackList extends Property<unknown[]> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value?.length) return undefined;
    const value = node.getValue();
    if (Array.isArray(value)) {
      return !value.some(v => this._value!.some(i => `${i}` === `${v}`));
    }
    else
    {
      return !this._value.some(i => `${i}` === `${value}`);
    }
  }
}
