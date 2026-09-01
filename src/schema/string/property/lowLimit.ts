import { Meta } from '../../../attribute/meta';
import { OfSchema } from '../../../property/core/ofSchema';
import { ForSchema } from '../../../property/core/forSchema';
import { SchemaType } from '../../../property/core/schemaType';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { Alias } from '../../../property/core/alias';
import { ConstraintProperty } from '../../../property/constraintProperty';
import { Error } from '../../../property/common/error';

import type { IValueAccess } from '../../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_INT, SCHEMA_KIND_STRING, SCHEMA_KIND_STRING_DEFINE, SCHEMA_KIND_STRING_USAGE, NS_SYSTEM_SCHEMA_PROPERTY_STRING } from '../../../utility/constant';

@Meta(Alias, 'lowlimit')
@Meta(ForSchema, [SCHEMA_KIND_STRING, SCHEMA_KIND_STRING_DEFINE, SCHEMA_KIND_STRING_USAGE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_STRING}.lowlimit`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_STRING}.lowlimit.error`)
export class LowLimitString extends ConstraintProperty<number> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    return node.toString().length >= this._value;
  }
}
