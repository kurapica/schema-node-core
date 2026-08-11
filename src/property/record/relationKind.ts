import { RecordProperty } from '../recordProperty';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { SCHEMA_KIND_ENUM, NS_SYSTEM_SCHEMA_RELATION, NS_SYSTEM_STRING } from '../../utility/constant';

@Meta(OfSchema, SCHEMA_KIND_ENUM)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_RELATION}.kind`)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
export class RelationKind extends RecordProperty<string> {}
