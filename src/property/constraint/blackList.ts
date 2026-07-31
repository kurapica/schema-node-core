import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, PropertyValueType } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_ENUM, SCHEMA_KIND_INT, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_LIST, NS_SYSTEM_STRING } from '../../utility/constant';
import { IValueAccess } from '../../runtime/interfaces';
import { Error } from '../common';

@Meta(ForSchema, [SCHEMA_KIND_ENUM, SCHEMA_KIND_INT, SCHEMA_KIND_STRING])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.blacklist`)
@Meta(PropertyValueType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_STRING}>`)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.blacklist.error`)
export class BlackList extends Property<string[]> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value?.length) return undefined;
    const value = node.getValue();
    return Array.isArray(value)
    ? value.every(v => this._value!.every(i => `${i}` !== `${v}`))
    : this._value.every(i => `${i}` !== `${value}`);
  }
}
