// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Unpack.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { ForSchema } from '../core/forSchema';
import { SchemaType } from '../core/schemaType';
import { Visible } from './visible';
import { PropertyValueType } from '../core/propertyValueType';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_SCHEMA_REFLECT, SCHEMA_KIND_OBJECT, NS_SYSTEM_BOOL, SCHEMA_KIND_STRUCT, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND } from '../../utility/constant';
import { Relation } from '../../attribute/relation';
import { buildFuncCall } from '../../schema/function/type';

/**
 * Declare the struct field is used for pack all non-struct fields data into it
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.unpack`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Relation(Visible,'call', buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, '@type', false, SCHEMA_KIND_OBJECT, SCHEMA_KIND_STRUCT))
export class Unpack extends Property<boolean> {}
