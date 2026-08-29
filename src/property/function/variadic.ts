import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { ForSchema } from '../core/forSchema';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_FUNC, NS_SYSTEM_BOOL, SCHEMA_KIND_FUNC_ARG } from '../../utility/constant';
import { InVisible } from '../common';

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(ForSchema, [SCHEMA_KIND_FUNC_ARG])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_FUNC}.variadic`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(InVisible, true) // @TODO: maybe we'll support custom function with variadic arguments
export class Variadic extends Property<boolean> {};