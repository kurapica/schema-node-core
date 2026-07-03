import { Meta } from '../../attribute/meta';
import { SchemaKind } from '../../property/record/schemaKind';
import { SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL } from '../../utility/constant';
import { ScalarSchema } from './scalarSchema';

@Meta(SchemaKind, [SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL])
export class BoolSchema extends ScalarSchema {}
