import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, PropertyValueType } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_BOOL, SCHEMA_KIND_FUNC_ARG } from '../../utility/constant';
import { IValueAccess } from '../../runtime/interfaces';

@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_FUNC_ARG])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.require`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class Require extends Property<boolean> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (this._value !== true) return undefined;
    return !node.isEmpty;
  }
}
