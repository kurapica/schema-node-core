// =============================================================================
// PropertySchema — extension data under "property" key
// =============================================================================

import { Meta, getMetaProperty } from '../../attribute/meta';
import { Base } from '../../property/core/base';
import { buildFuncCall } from '../../schema/function/type';
import { SchemaKind } from '../../property/record/schemaKind';
import { NodeSchemaKind } from '../../property/record/nodeSchemaKind';
import { SchemaType } from '../../property/core/schemaType';
import { Attach } from '../../property/core/attach';
import { Append } from '../../property/core/append';
import { OfSchema } from '../../property/core/ofSchema';
import { SchemaGenerator } from '../../property/core/schemaGenerator';
import { Require } from '../../property/constraint/require';
import { PropertyValueType } from '../../property/core/propertyValueType';
import { Valid } from '../../property/constraint/valid';
import { Display } from '../../property/common/display';
import type { PropertyCtor } from '../../interface';
import { Stackable } from '../../property/core/stackable';
import { Static } from '../../property/core/static';
import { getPropertyName } from '../../property/property';
import { setPropertyValue, setProperty } from '../../property/propertyOwner';
import { getMetaPropertiesForSchema, getPropertyTypeSupportSchemas, saveNodeSchema } from '../../runtime/schemaRuntime';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_NODE, NS_SYSTEM_SCHEMA_PROPERTY, NS_SYSTEM_IDENTIFIER, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_LIST, NS_SYSTEM_SCHEMA_KIND, NS_SYSTEM_BOOL, SCHEMA_KIND_ORDER_PROP, NS_SYSTEM_SCHEMA_PROPERTY_TYPE, NODE_SELF, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_STRING } from '../../utility/constant';
import { combinePaths } from '../../utility/toolset';
import { Relations } from '../relation/property';
import type { PropertySchema } from './type';
import type { NodeSchema } from '../node/type';
import { PropertyProperty } from './property';

/** Meta registration class (NOT exported). */
@Meta(SchemaKind, [SCHEMA_KIND_PROPERTY, SCHEMA_KIND_ORDER_PROP])
@Meta(NodeSchemaKind, [SCHEMA_KIND_PROPERTY, SCHEMA_KIND_ORDER_PROP])
@Meta(SchemaGenerator, generatePropertySchema)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY}.schema`)
@Meta(Attach, SCHEMA_KIND_PROPERTY)
@Meta(Append, [Relations])
class PropertySchemaMeta implements PropertySchema {
  /** The property name, such as 'upLimit' */
  @Meta(SchemaType, NS_SYSTEM_IDENTIFIER)
  @Meta(Require, true)
  property!: string;

  /** The property value type */
  @Meta(SchemaType, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
  @Meta(Require, true)
  type!: string;

  /** the schema kinds that the property applies to */
  @Meta(SchemaType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_SCHEMA_KIND}>`)
  forSchemas?: string[];

  /** Whether the property value can't be changed by relations */
  @Meta(SchemaType, NS_SYSTEM_BOOL)
  static?: boolean;

  /** Whether the property is stackable */
  @Meta(SchemaType, NS_SYSTEM_BOOL)
  stackable?: boolean;
}

/** Represents the property type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_SCHEMA_PROPERTY_TYPE)
@Meta(Base, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE)
@Meta(Valid, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NODE_SELF, SCHEMA_KIND_PROPERTY))
class PropertyTypeMeta {}

/** Generate property schema */
function generatePropertySchema(namespace: string, name: string, ctor: Function) {
  
    const nodeSchema : NodeSchema = { namespace, name, kind: SCHEMA_KIND_PROPERTY };
    setPropertyValue(nodeSchema, Display, { key: combinePaths(namespace, name) });
    
    const type = getMetaProperty(ctor, PropertyValueType)?.getValue<string>();
    if (!type) throw new Error(`Property schema ${namespace}.${name} must have a value type.`);

    const isStatic = getMetaProperty(ctor, Static)?.getValue<boolean>();
    const stackable = getMetaProperty(ctor, Stackable)?.getValue<boolean>();
    const forSchemas = getPropertyTypeSupportSchemas(ctor as PropertyCtor);
    const propSchema : PropertySchema = { property: getPropertyName(ctor as PropertyCtor), type, static: isStatic, stackable, forSchemas };
    
    getMetaPropertiesForSchema(SCHEMA_KIND_NODE, ctor).forEach(p => setProperty(nodeSchema, p));
    getMetaPropertiesForSchema(SCHEMA_KIND_PROPERTY, ctor).forEach(p => setProperty(propSchema, p));
    setPropertyValue(nodeSchema, PropertyProperty, propSchema);
    saveNodeSchema(nodeSchema);
}
