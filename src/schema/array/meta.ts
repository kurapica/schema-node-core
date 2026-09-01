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
import { Valid } from '../../property/common/valid';
import { Require } from '../../property/common/require';
import { EntrySourceProvider } from '../../property/core/entrySourceProvider';
import { AccessValueTypeProvider } from '../../property/core/accessValueTypeProvider';
import { Relations } from '../relation/property';
import { ArrayType } from './runtime';
import { ArrayValue } from './property/arrayValue';
import { DataNodeType } from '../../property/core/dataNodeType';
import { ArrayNode } from './node';
import { Generics } from '../generic/generics';

import type { ArraySchema } from './type';

import { SCHEMA_KIND_ARRAY, NS_SYSTEM_SCHEMA_ARRAY, NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_ARRAY_TYPE, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT, NS_SYSTEM_SCHEMA_REFLECT_IS_ARRAY_ELE, SCHEMA_KIND_ORDER_ARRAY, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, ENTRY_ROOT, SCHEMA_KIND_ARRAY_DEFINE, NS_SYSTEM_SCHEMA_REFLECT_STRUCT, SCHEMA_KIND_STRUCT, ARRAY_ELEMENT, SCHEMA_KIND_ARRAY_USAGE } from '../../utility/constant';
import { SchemaUsage } from '../../property/core/schemaUsage';
import { Relation } from '../../attribute/relation';
import { Visible } from '../../property/common/visible';
import { EntrySource } from '../../property/core/entrySource';

/** The array schema kind */
@Meta(SchemaKind, [SCHEMA_KIND_ARRAY, SCHEMA_KIND_ORDER_ARRAY])
@Meta(NodeSchemaKind, [SCHEMA_KIND_ARRAY, SCHEMA_KIND_ORDER_ARRAY])
@Meta(ValueSchemaKind, [SCHEMA_KIND_ARRAY, SCHEMA_KIND_ORDER_ARRAY])
@Meta(RuntimeNodeType, ArrayType)
@Meta(SchemaUsage, `${NS_SYSTEM_SCHEMA_ARRAY}.usage`)
@Meta(Append, [Generics, Relations])
@Meta(ArrayValue)
@Meta(DataNodeType, ArrayNode)
class ArrayKind{}

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_ARRAY_DEFINE, SCHEMA_KIND_ORDER_ARRAY])
@Meta(Append, [Generics, Relations])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ARRAY}.schema`)
@Meta(Attach, SCHEMA_KIND_ARRAY_DEFINE)
@Meta(EntrySourceProvider, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getaccessentries`, '@element', NODE_SELF, ENTRY_ROOT))
@Meta(AccessValueTypeProvider, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getaccessvaluetype`, '@element', NODE_SELF))
@Relation(Visible,'call', buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, '@element', true, SCHEMA_KIND_STRUCT), 'primary')
@Relation(EntrySource,'assign', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_STRUCT}.getindexablefields`, '@element'), `primary.${ARRAY_ELEMENT}`)
@Relation(Visible,'call', buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, '@element', true, SCHEMA_KIND_STRUCT), 'indexes')
@Relation(EntrySource,'assign', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_STRUCT}.getindexablefields`, '@element'), `indexes.${ARRAY_ELEMENT}.fields.${ARRAY_ELEMENT}`)
class ArraySchemaMeta implements ArraySchema {
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT)
  @Meta(Require, true)
  element: string = '';
}

/** The array usage schema kind */
@Meta(SchemaKind, [SCHEMA_KIND_ARRAY_USAGE, SCHEMA_KIND_ORDER_ARRAY])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ARRAY}.usage`)
@Meta(Attach, SCHEMA_KIND_ARRAY_USAGE)
class ArrayUsage {}

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