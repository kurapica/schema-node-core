// =============================================================================
// ArraySchema — extension data under "array" key
// =============================================================================

import { Meta } from '../attribute/meta';
import { Relation } from '../attribute/relation';
import { ArrayValue } from '../property/constraint/arrayValue';
import { Base } from '../property/core/base';
import { RuntimeNodeType } from '../property/core/runtimeNodeType';
import { buildFuncCall } from '../property/funcCallProperty';
import { SchemaKind, NodeSchemaKind, ValueSchemaKind, SchemaType, Attach, Append, ForSchema, OfSchema, Valid, Visible, PropertyValueType, Require, Default, EntrySourceProvider, AccessValueTypeProvider } from '../property/index';
import { IProperty, Property } from '../property/property';
import { combineProperties } from '../property/propertyOwner';
import { Call } from '../relation/call';
import { ArrayType } from '../runtime/type';
import { SCHEMA_KIND_ARRAY, SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_ARRAY, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_ARRAY_TYPE, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT, NS_SYSTEM_SCHEMA_REFLECT_IS_ARRAY_ELE, SCHEMA_KIND_ORDER_ARRAY, NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, ENTRY_ROOT } from '../utility/constant';
import { Relations } from './relationSchema';

/** The array schema */
export interface ArraySchema {
  element: string;
}

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_ARRAY, SCHEMA_KIND_ORDER_ARRAY])
@Meta(NodeSchemaKind, [SCHEMA_KIND_ARRAY, SCHEMA_KIND_ORDER_ARRAY])
@Meta(ValueSchemaKind, [SCHEMA_KIND_ARRAY, SCHEMA_KIND_ORDER_ARRAY])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ARRAY}.schema`)
@Meta(RuntimeNodeType, ArrayType)
@Meta(Attach, SCHEMA_KIND_ARRAY)
@Meta(ArrayValue)
@Meta(Append, [Relations])
@Meta(EntrySourceProvider, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getaccessentries`, '@element', NODE_SELF, ENTRY_ROOT))
@Meta(AccessValueTypeProvider, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getaccessvaluetype`, '@element', NODE_SELF))
class ArraySchemaMeta implements ArraySchema {
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_ARRAY_ELEMENT)
  @Meta(Require, true)
  element: string = '';
}

/** The array property for node schema */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.array`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_ARRAY}.schema`)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', SCHEMA_KIND_ARRAY))
@Relation(Default, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.genarrayname`, "@array.element"), "name")
@Relation(Default, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.genarraydisplay`, "@array.element"), "display.key")
export class ArrayProperty extends Property<ArraySchema> {
  combine(other: IProperty): boolean {
    const otherSchema = other.getValue<ArraySchema>();
    if (!otherSchema) return false;
    const selfSchema = this.getValue<ArraySchema>();
    if (!selfSchema)
    {
      this.setValue(otherSchema);
      return true;
    }
    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_ARRAY);
    this.setValue(selfSchema);
    return true;
  }
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