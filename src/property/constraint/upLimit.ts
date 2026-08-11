import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { Alias } from '../core/alias';
import { ForSchema } from '../core/forSchema';
import { ConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_DATE, NS_SYSTEM_INT, NS_SYSTEM_NUMBER, SCHEMA_KIND_INT, SCHEMA_KIND_STRING, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_DATE } from '../../utility/constant';
import { IValueAccess } from '../../runtime/interfaces';
import { isNull, parseDate } from '../../utility/toolset';
import { Error } from '../common/error';
import { StackUpLimit } from '../common/stackUpLimit';
import { DataNode } from '../../node/dataNode';

@Meta(Alias, 'uplimit')
@Meta(ForSchema, [SCHEMA_KIND_STRING])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.UpLimitString`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.uplimitstring.error`)
export class UpLimitString extends ConstraintProperty<number> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    return node.toString().length <= this._value;
  }
}

@Meta(Alias, 'uplimit')
@Meta(ForSchema, [SCHEMA_KIND_INT])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.UpLimitInt`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.uplimitint.error`)
export class UpLimitInt extends ConstraintProperty<number> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    const value = node.getValue() as number;
    if (isNull(value) || isNull(this._value)) return undefined;
    if (node.getPropertyValue<boolean>(StackUpLimit))
    {
      let original = (node as DataNode).original;
      if (!isNull(original))
      {
        original = parseInt(`${original}`);
        if (!isNaN(original))
          return value <= this._value! + original;
      }
    }

    return value <= this._value!;
  }
}

@Meta(Alias, 'uplimit')
@Meta(ForSchema, [SCHEMA_KIND_DECIMAL])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.UpLimitNumber`)
@Meta(PropertyValueType, NS_SYSTEM_NUMBER)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.uplimitnumber.error`)
export class UpLimitNumber extends ConstraintProperty<number> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    const value = node.getValue() as number;
    if (isNull(value) || isNull(this._value)) return undefined;
    if (node.getPropertyValue<boolean>(StackUpLimit))
    {
      let original = (node as DataNode).original;
      if (!isNull(original))
      {
        original = parseFloat(`${original}`);
        if (!isNaN(original))
          return value <= this._value! + original;
      }
    }
    return value <= this._value!;
  }
}

@Meta(Alias, 'uplimit')
@Meta(ForSchema, [SCHEMA_KIND_DATE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.UpLimitDate`)
@Meta(PropertyValueType, NS_SYSTEM_DATE)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.uplimitdate.error`)
export class UpLimitDate extends ConstraintProperty<Date> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    const value = node.getValue() as Date;
    if (isNull(value) || isNull(this._value)) return undefined;
    const upLimit = parseDate(this._value);
    if (!upLimit) return undefined;
    return value <= upLimit;
  }
}