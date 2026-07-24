// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Unpack.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, Visible } from '../index';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_SCHEMA_REFLECT, SCHEMA_KIND_OBJECT } from '../../utility/constant';
import { Relation } from '../../attribute/relation';
import { Call } from '../../relation/call';
import { buildFuncCall } from '../funcCallProperty';

/**
 * Declare the struct field is used for pack all non-struct fields data into it
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.unpack`)
@Relation(Visible, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT}.isvaluekind`, '@type', SCHEMA_KIND_OBJECT))
export class Unpack extends Property<boolean> {}
