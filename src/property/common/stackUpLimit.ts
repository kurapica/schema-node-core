// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/StackUpLimit.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { ForSchema } from '../core/forSchema';
import { PropertyValueType } from '../core/propertyValueType';
import { buildFuncCall } from '../funcCallProperty';
import { Visible } from './visible';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_REFLECT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_INT, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND } from '../../utility/constant';
import { Relation } from '../../attribute/relation';
import { Call } from '../../relation/call';

/**
 * When calcuating the stack up limit of a struct, this property indicates whether the origin value should be included in the calculation.
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.StackUpLimit`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, "@type", false, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL))
export class StackUpLimit extends Property<boolean> {}
