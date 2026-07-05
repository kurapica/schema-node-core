// =============================================================================
// ObjectSchema — arbitrary JSON value container
// =============================================================================

import { Meta } from '../attribute/meta';
import { RuntimeNodeType } from '../property/core/RuntimeNodeType';
import { SchemaKind, NodeSchemaKind, ValueSchemaKind, SchemaType, SchemaGenerator } from '../property/index';
import { ObjectType } from '../runtime/type';
import { SCHEMA_KIND_OBJECT, SCHEMA_KIND_ORDER_OBJECT } from '../utility/constant';

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_OBJECT, SCHEMA_KIND_ORDER_OBJECT])
@Meta(NodeSchemaKind, [SCHEMA_KIND_OBJECT, SCHEMA_KIND_ORDER_OBJECT])
@Meta(ValueSchemaKind, [SCHEMA_KIND_OBJECT, SCHEMA_KIND_ORDER_OBJECT])
@Meta(RuntimeNodeType, ObjectType)
class ObjectSchemaMeta {}