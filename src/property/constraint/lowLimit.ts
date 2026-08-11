import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { ForSchema } from '../core/forSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { Alias } from '../core/alias';
import { ConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_INT, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_INT, NS_SYSTEM_NUMBER, NS_SYSTEM_DATE, SCHEMA_KIND_STRING, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_DATE } from '../../utility/constant';
import { IValueAccess } from '../../runtime/interfaces';
import { isNull, parseDate } from '../../utility/toolset';
import { Error } from '../common/error';

@Meta(Alias, 'lowlimit')
@Meta(ForSchema, [SCHEMA_KIND_STRING])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.lowlimitstring`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.lowlimitstring.error`)
export class LowLimitString extends ConstraintProperty<number> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    return node.toString().length >= this._value;
  }
}

@Meta(Alias, 'lowlimit')
@Meta(ForSchema, [SCHEMA_KIND_INT])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.lowlimitint`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.lowlimitint.error`)
export class LowLimitInt extends ConstraintProperty<number> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    const value = node.getValue() as number;
    if (isNull(value) || isNull(this._value)) return undefined;
    return value >= this._value!;
  }
}

@Meta(Alias, 'lowlimit')
@Meta(ForSchema, [SCHEMA_KIND_DECIMAL])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.lowlimitnumber`)
@Meta(PropertyValueType, NS_SYSTEM_NUMBER)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.lowlimitnumber.error`)
export class LowLimitNumber extends ConstraintProperty<number> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    const value = node.getValue() as number;
    if (isNull(value) || isNull(this._value)) return undefined;
    return value >= this._value!;
  }
}

@Meta(Alias, 'lowlimit')
@Meta(ForSchema, [SCHEMA_KIND_DATE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.lowlimitdate`)
@Meta(PropertyValueType, NS_SYSTEM_DATE)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.lowlimitdate.error`)
export class LowLimitDate extends ConstraintProperty<number> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    const value = node.getValue() as Date;
    if (isNull(value) || isNull(this._value)) return undefined;
    const lowLimit = parseDate(this._value);
    if (!lowLimit) return undefined;
    return value >= lowLimit;
  }
}
