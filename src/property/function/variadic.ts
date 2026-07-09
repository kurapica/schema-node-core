import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, PropertyValueType, ForSchema } from '../index';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_FUNC, NS_SYSTEM_BOOL, SCHEMA_KIND_FUNC_ARG } from '../../utility/constant';

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(ForSchema, [SCHEMA_KIND_FUNC_ARG])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_FUNC}.variadic`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class Variadic extends Property<boolean> {};