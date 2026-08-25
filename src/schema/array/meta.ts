// =============================================================================
// ArraySchema — extension data under "array" key
// =============================================================================

import { Meta } from '../../attribute/meta';
import { Base } from '../../property/core/base';
import { RuntimeNodeType } from '../../property/core/runtimeNodeType';
import { buildFuncCall } from '../../schema/function/type';
import { SchemaKind } from '../../property/record/schemaKind';
import { NodeSchemaKind } from '../../property/record/nodeSchemaKind';
import { ValueSchemaKind } from '../../property/record/valueSchemaKind';
import { SchemaType } from '../../property/core/schemaType';
import { Attach } from '../../property/core/attach';
import { Append } from '../../property/core/append';
import { OfSchema } from '../../property/core/ofSchema';
import { Valid } from '../../property/constraint/valid';
import { Require } from '../../property/constraint/require';
import { EntrySourceProvider } from '../../property/core/entrySourceProvider';
import { AccessValueTypeProvider } from '../../property/core/accessValueTypeProvider';
import { Relations } from '../relation/property';
import { ArrayType } from './runtime';
import { ArrayValue } from './valid';
import { DataNodeType } from '../../property/core/dataNodeType';
import { ArrayNode } from './node';

import type { ArraySchema } from './type';

import { SCHEMA_KIND_ARRAY, NS_SYSTEM_SCHEMA_ARRAY, NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_ARRAY_TYPE, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT, NS_SYSTEM_SCHEMA_REFLECT_IS_ARRAY_ELE, SCHEMA_KIND_ORDER_ARRAY, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, ENTRY_ROOT } from '../../utility/constant';

/** The array schema kind */
@Meta(SchemaKind, [SCHEMA_KIND_ARRAY, SCHEMA_KIND_ORDER_ARRAY])
@Meta(NodeSchemaKind, [SCHEMA_KIND_ARRAY, SCHEMA_KIND_ORDER_ARRAY])
@Meta(ValueSchemaKind, [SCHEMA_KIND_ARRAY, SCHEMA_KIND_ORDER_ARRAY])
@Meta(RuntimeNodeType, ArrayType)
@Meta(ArrayValue)
@Meta(DataNodeType, ArrayNode)
@Meta(Append, [Relations])
class ArrayKind{}

/** Meta registration class (NOT exported). */
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ARRAY}.schema`)
@Meta(Attach, SCHEMA_KIND_ARRAY)
@Meta(EntrySourceProvider, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getaccessentries`, '@element', NODE_SELF, ENTRY_ROOT))
@Meta(AccessValueTypeProvider, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getaccessvaluetype`, '@element', NODE_SELF))
class ArraySchemaMeta implements ArraySchema {
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT)
  @Meta(Require, true)
  element: string = '';
}

/** Represents the array value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_ARRAY_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, false, SCHEMA_KIND_ARRAY))
class ArrayTypeMeta {}

/** Represents the array element value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_ARRAY_ELE, NODE_SELF))
class ArrayElementTypeMeta {}