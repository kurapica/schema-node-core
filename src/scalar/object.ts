import { Meta } from '../attribute/meta';
import { OfSchema } from '../property/core/ofSchema';
import { SchemaType } from '../property/core/schemaType';
import { SCHEMA_KIND_OBJECT, NS_SYSTEM_OBJECT } from '../utility/constant';

/** Represents the object type */
@Meta(OfSchema, SCHEMA_KIND_OBJECT)
@Meta(SchemaType, NS_SYSTEM_OBJECT)
class ObjectMeta {}
