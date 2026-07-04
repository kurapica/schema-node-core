import { Meta } from '../../attribute/meta';
import { RuntimeNodeType } from '../../property/core/RuntimeNodeType';
import { NodeSchemaKind } from '../../property/record/nodeSchemaKind';
import { SchemaKind } from '../../property/record/schemaKind';
import { ValueSchemaKind } from '../../property/record/valueSchemaKind';
import { BoolType } from '../../runtime/type/scalar/boolType';
import { SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL } from '../../utility/constant';

/**
 * The bool schema kind is used to define a boolean value. It can be used to represent true/false values in the schema.
 * There is no meta data associated with the bool schema kind, as it is a simple scalar type. The bool schema kind is used in various contexts where a boolean value is required, such as in conditional statements or to represent binary states.
 */
@Meta(SchemaKind, [SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL])
@Meta(NodeSchemaKind, [SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL])
@Meta(ValueSchemaKind, [SCHEMA_KIND_BOOL, SCHEMA_KIND_ORDER_BOOL])
@Meta(RuntimeNodeType, BoolType)
export class BoolSchema {}
