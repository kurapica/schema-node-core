import { RecordProperty } from '../recordProperty';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, PropertyValueType } from '../index';
import { SCHEMA_KIND_ENUM, NS_SYSTEM_SCHEMA_NODE, NS_SYSTEM_STRING } from '../../utility/constant';

@Meta(OfSchema, SCHEMA_KIND_ENUM)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_NODE}.kind`)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
export class NodeSchemaKind extends RecordProperty<string> {}
