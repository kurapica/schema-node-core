import { Meta } from '../../../attribute/meta';
import { Default } from '../../../property/common/default';
import { InVisible } from '../../../property/common/invisible';
import { Alias } from '../../../property/core/alias';
import { ForSchema } from '../../../property/core/forSchema';
import { OfSchema } from '../../../property/core/ofSchema';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { SchemaType } from '../../../property/core/schemaType';
import { Static } from '../../../property/core/static';
import { Error } from '../../../property/common/error';
import { ConstraintProperty } from '../../../property/constraintProperty';
import { isNull } from '../../../utility/toolset';

import type { IValueAccess } from '../../../interface';

import { SCHEMA_KIND_DATE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_PRO_DATE } from '../../../utility/constant';

@Meta(Alias, 'date')
@Meta(ForSchema, [SCHEMA_KIND_DATE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_DATE}.valid`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(InVisible, true)
@Meta(Default, true)
@Meta(Static, true)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PRO_DATE}.error`)
export class DateValue extends ConstraintProperty<Date> {
  override get hasValue(): boolean { return true; }

  async validate(node: IValueAccess): Promise<boolean | undefined> { 
    if (node.isEmpty) return undefined;
    const value = node.getValue() as Date;
    return !isNull(value) && !isNaN(value.getTime());
  }
}
