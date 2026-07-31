import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, PropertyValueType } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_ENUM, SCHEMA_KIND_INT, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_LIST, NS_SYSTEM_STRING } from '../../utility/constant';
import { IValueAccess } from '../../runtime/interfaces';
import { AsSuggest, Error } from '../common';
import { isNull } from '../../utility';

@Meta(ForSchema, [SCHEMA_KIND_ENUM, SCHEMA_KIND_INT, SCHEMA_KIND_STRING])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.whitelist`)
@Meta(PropertyValueType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_STRING}>`)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.whitelist.error`)
export class WhiteList extends Property<string[]> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    const value = node.getValue();
    if (isNull(value) || !this._value?.length || node.getPropertyValue(AsSuggest)) return undefined;
    return Array.isArray(value)
      ? value.every(v => this._value!.some(i => `${i}` === `${v}`))
      : this._value.some(i => `${i}` === `${value}`);
  }
}