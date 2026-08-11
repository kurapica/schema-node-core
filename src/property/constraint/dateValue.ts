import { Meta } from '../../attribute/meta';
import { IValueAccess } from "../../runtime/interfaces";
import { SCHEMA_KIND_DATE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_BOOL } from '../../utility/constant';
import { isNull } from '../../utility/toolset';
import { InVisible } from '../common/invisible';
import { Default } from '../common/default';
import { ConstraintProperty } from "../constraintProperty";
import { Alias } from '../core/alias';
import { ForSchema } from '../core/forSchema';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { Static } from '../core/static';
import { Error } from '../common/error';

@Meta(Alias, 'date')
@Meta(ForSchema, [SCHEMA_KIND_DATE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.date`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(InVisible, true)
@Meta(Default, true)
@Meta(Static, true)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.date.error`)
export class DateValue extends ConstraintProperty<Date> {
  override get hasValue(): boolean { return true; }

  async validate(node: IValueAccess): Promise<boolean | undefined> { 
    if (node.isEmpty) return undefined;
    const value = node.getValue() as Date;
    return !isNull(value) && !isNaN(value.getTime());
  }
}
