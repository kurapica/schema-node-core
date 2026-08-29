import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_FUNC, NS_SYSTEM_BOOL, SCHEMA_KIND_FUNCTION } from '../../utility/constant';
import { ForSchema, Static } from '../core';
import { ReadOnly } from '../common/readOnly';
import { InVisible } from '../common/invisible';

@Meta(ForSchema, SCHEMA_KIND_FUNCTION)
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_FUNC}.nocache`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
export class NoCache extends Property<boolean> {}
