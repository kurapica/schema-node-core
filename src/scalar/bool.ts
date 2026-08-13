import { Meta } from '../attribute/meta';
import { OfSchema } from '../property/core/ofSchema';
import { SchemaType } from '../property/core/schemaType';

import { SCHEMA_KIND_BOOL, NS_SYSTEM_BOOL } from '../utility/constant';

/** Represents the boolean type */
@Meta(OfSchema, SCHEMA_KIND_BOOL)
@Meta(SchemaType, NS_SYSTEM_BOOL)
class BoolMeta {}