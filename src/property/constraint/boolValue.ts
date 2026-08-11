import { Meta } from '../../attribute/meta';
import { IValueAccess } from "../../runtime/interfaces";
import { SCHEMA_KIND_ENUM, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_BOOL } from '../../utility/constant';
import { InVisible } from '../common/invisible';
import { Default } from '../common/default';
import { Error } from '../common/error';
import { ConstraintProperty } from "../constraintProperty";
import { Alias } from '../core/alias';
import { ForSchema } from '../core/forSchema';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { Static } from '../core/static';

@Meta(Alias, 'bool')
@Meta(ForSchema, [SCHEMA_KIND_ENUM])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.bool`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(InVisible, true)
@Meta(Default, true)
@Meta(Static, true)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.bool.error`)
export class BoolValue extends ConstraintProperty<boolean> {
  override get hasValue(): boolean { return true; }
  async validate(node: IValueAccess): Promise<boolean | undefined>{ return undefined }
}
