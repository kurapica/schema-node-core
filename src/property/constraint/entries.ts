import { Property } from '../property';
import type { IConstraintProperty } from '../constraintProperty';
import { Entry } from '../../struct/entry';
import { IValueAccess } from '../../runtime/interfaces';
import { Alias, ForSchema, OfSchema, SchemaType } from '../core';
import { Meta } from '../../attribute/meta';
import { NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, SCHEMA_KIND_INT, SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRING } from '../../utility/constant';
import { Error } from '../common';

@Meta(Alias, 'entries')
@Meta(ForSchema, [SCHEMA_KIND_STRING])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.StringEntries`)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.stringentries.error`)
export class StringEntries extends Property<Entry<string>[]> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value?.length) return undefined;
    const value = node.getValue();
    if (Array.isArray(value)) {
      return value.every(v => this._value!.some(i => `${i.value}` === `${v}`));
    }
    else
    {
      return this._value.some(i => `${i.value}` === `${value}`);
    }
  }
}

@Meta(Alias, 'entries')
@Meta(ForSchema, [SCHEMA_KIND_INT])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.IntEntries`)
export class IntEntries extends Property<Entry<number>[]> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value?.length) return undefined;
    const value = node.getValue();
    if (Array.isArray(value)) {
      return value.every(v => this._value!.some(i => `${i.value}` === `${v}`));
    }
    else
    {
      return this._value.some(i => `${i.value}` === `${value}`);
    }
  }
}
