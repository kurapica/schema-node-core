import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { ForSchema } from '../core/forSchema';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_FUNC, NS_SYSTEM_BOOL, SCHEMA_KIND_FUNCTION } from '../../utility/constant';

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(ForSchema, [SCHEMA_KIND_FUNCTION])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_FUNC}.serveronly`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class ServerOnly extends Property<boolean> {}
