import { RecordProperty } from '../recordProperty';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, PropertyValueType } from '../index';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_NODE, NS_SYSTEM_STRING } from '../../utility/constant';

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_NODE}.valuekind`)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
export class ValueSchemaKind extends RecordProperty<string> {}
