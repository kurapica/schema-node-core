import { Meta } from "../attribute/meta";
import { OfSchema } from '../property/core/ofSchema';
import { SchemaType } from '../property/core/schemaType';
import { SCHEMA_KIND_FUNCTION, NS_SYSTEM_DATA } from "../utility/constant";

@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
@Meta(SchemaType, NS_SYSTEM_DATA)
export class SystemData {}