// =============================================================================
// ArraySchema — extension data under "array" key
// =============================================================================

import { Meta } from '../../attribute/meta';
import { Relation } from '../../attribute/relation';
import { ArrayValue } from '../../property/constraint/arrayValue';
import { Base } from '../../property/core/base';
import { RuntimeNodeType } from '../../property/core/runtimeNodeType';
import { buildFuncCall } from '../../property/funcCallProperty';
import { SchemaKind } from '../../property/record/schemaKind';
import { NodeSchemaKind } from '../../property/record/nodeSchemaKind';
import { ValueSchemaKind } from '../../property/record/valueSchemaKind';
import { SchemaType } from '../../property/core/schemaType';
import { Attach } from '../../property/core/attach';
import { Append } from '../../property/core/append';
import { ForSchema } from '../../property/core/forSchema';
import { OfSchema } from '../../property/core/ofSchema';
import { Valid } from '../../property/constraint/valid';
import { Visible } from '../../property/common/visible';
import { PropertyValueType } from '../../property/core/propertyValueType';
import { Require } from '../../property/constraint/require';
import { Default } from '../../property/common/default';
import { EntrySourceProvider } from '../../property/core/entrySourceProvider';
import { AccessValueTypeProvider } from '../../property/core/accessValueTypeProvider';
import { IProperty, Property } from '../../property/property';
import { combineProperties } from '../../property/propertyOwner';
import { Call } from '../../relation/call';
import { ArrayType } from '../../runtime/type/arrayType';
import { SCHEMA_KIND_ARRAY, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_ARRAY, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_ARRAY_TYPE, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT, NS_SYSTEM_SCHEMA_REFLECT_IS_ARRAY_ELE, SCHEMA_KIND_ORDER_ARRAY, NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, ENTRY_ROOT } from '../../utility/constant';
import { ArraySchema } from './type';
import { Relations } from '../relation/relations';

/** The array schema kind */
@Meta(SchemaKind, [SCHEMA_KIND_ARRAY, SCHEMA_KIND_ORDER_ARRAY])
@Meta(NodeSchemaKind, [SCHEMA_KIND_ARRAY, SCHEMA_KIND_ORDER_ARRAY])
@Meta(ValueSchemaKind, [SCHEMA_KIND_ARRAY, SCHEMA_KIND_ORDER_ARRAY])
@Meta(RuntimeNodeType, ArrayType)
@Meta(ArrayValue)
@Meta(Append, [Relations])
class ArraySchemaKind{}

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
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, SCHEMA_KIND_ARRAY))
class ArrayTypeMeta {}

/** Represents the array element value type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_ARRAY_ELE, NODE_SELF))
class ArrayElementTypeMeta {}