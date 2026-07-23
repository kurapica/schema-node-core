import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, PropertyValueType, Alias, ForSchema } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_DATE, NS_SYSTEM_INT, NS_SYSTEM_NUMBER, SCHEMA_KIND_INT } from '../../utility/constant';
import { IValueAccess } from '../../runtime/interfaces';
import { parseDate } from '../../utility/toolset';

@Meta(Alias, 'uplimit')
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.UpLimitString`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
export class UpLimitString extends Property<number> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    return node.toString().length <= this._value;
  }
}

@Meta(Alias, 'uplimit')
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(ForSchema, [SCHEMA_KIND_INT])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.UpLimitInt`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
export class UpLimitInt extends Property<number> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    return node.getValue() as number <= this._value;
  }
}

@Meta(Alias, 'uplimit')
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.UpLimitNumber`)
@Meta(PropertyValueType, NS_SYSTEM_NUMBER)
export class UpLimitNumber extends Property<number> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    return node.getValue() as number <= this._value;
  }
}

@Meta(Alias, 'uplimit')
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.UpLimitDate`)
@Meta(PropertyValueType, NS_SYSTEM_DATE)
export class UpLimitDate extends Property<Date> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    const upLimit = parseDate(this._value);
    if (!upLimit) return undefined;
    return (node.getValue() as Date) <= upLimit;
  }
}