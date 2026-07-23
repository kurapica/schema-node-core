import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, PropertyValueType, Alias } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_INT, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_INT, NS_SYSTEM_NUMBER, NS_SYSTEM_DATE } from '../../utility/constant';
import { IValueAccess } from '../../runtime/interfaces';
import { parseDate } from '../../utility/toolset';

@Meta(Alias, 'lowlimit')
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.LowLimitString`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
export class LowLimitString extends Property<number> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    return node.toString().length >= this._value;
  }
}

@Meta(Alias, 'lowlimit')
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(ForSchema, [SCHEMA_KIND_INT])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.LowLimitInt`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
export class LowLimitInt extends Property<number> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    return node.getValue() as number >= this._value;
  }
}

@Meta(Alias, 'lowlimit')
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.LowLimitNumber`)
@Meta(PropertyValueType, NS_SYSTEM_NUMBER)
export class LowLimitNumber extends Property<number> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    return node.getValue() as number >= this._value;
  }
}

@Meta(Alias, 'lowlimit')
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.LowLimitDate`)
@Meta(PropertyValueType, NS_SYSTEM_DATE)
export class LowLimitDate extends Property<number> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    const upLimit = parseDate(this._value);
    if (!upLimit) return undefined;
    return (node.getValue() as Date) >= upLimit;
  }
}
