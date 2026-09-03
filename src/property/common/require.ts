import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { ConstraintProperty } from '../constraintProperty';

import type { IValueAccess } from '../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_COMMON, NS_SYSTEM_BOOL } from '../../utility/constant';

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_COMMON}.require`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class Require extends ConstraintProperty<boolean> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (this._value !== true) return undefined;
    return !node.isEmpty;
  }
}
