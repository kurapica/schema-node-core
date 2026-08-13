import { RecordProperty } from '../recordProperty';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_ERROR, NS_SYSTEM_STRING } from '../../utility/constant';

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_ERROR)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
export class ErrorCode extends RecordProperty<string> {}
