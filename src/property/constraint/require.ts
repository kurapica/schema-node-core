import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { ForSchema } from '../core/forSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { ConstraintProperty } from '../constraintProperty';

import type { IValueAccess } from '../../interface';

import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_BOOL, SCHEMA_KIND_FUNC_ARG } from '../../utility/constant';

@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_FUNC_ARG])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.require`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class Require extends ConstraintProperty<boolean> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (this._value !== true) return undefined;
    return !node.isEmpty;
  }
}
