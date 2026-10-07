import { RecordProperty } from '../recordProperty';
import { Meta } from '../../attribute/meta';
import { OfNodeKind } from '../core/ofNodeKind';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';

import { NODE_KIND_PROPERTY, NS_SYSTEM_SCHEMA_ERROR, NS_SYSTEM_STRING } from '../../utility/constant';

@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_ERROR)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
export class ErrorCode extends RecordProperty<string> {}
