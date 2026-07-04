import { Meta } from '../../attribute/meta';
import { RuntimeNodeType } from '../../property/core/RuntimeNodeType';
import { NodeSchemaKind } from '../../property/record/nodeSchemaKind';
import { SchemaKind } from '../../property/record/schemaKind';
import { ValueSchemaKind } from '../../property/record/valueSchemaKind';
import { BoolType } from '../../runtime/type/scalar/boolType';
import { SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL } from '../../utility/constant';

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL])
@Meta(NodeSchemaKind, [SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL])
@Meta(ValueSchemaKind, [SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL])
@Meta(RuntimeNodeType, BoolType)
class BoolSchemaMeta {}
