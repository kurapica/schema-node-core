// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Unpack.cs
// =============================================================================

import { Meta } from '../../../attribute/meta';
import { OfSchema } from '../../../property/core/ofSchema';
import { ForSchema } from '../../../property/core/forSchema';
import { SchemaType } from '../../../property/core/schemaType';
import { Visible } from '../../../property/common/visible';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { Relation } from '../../../attribute/relation';
import { buildFuncCall } from '../../../schema/function/type';

import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_OBJECT, NS_SYSTEM_BOOL, SCHEMA_KIND_STRUCT, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NS_SYSTEM_SCHEMA_PRO_STRUCT, TYPE_PROVIDER } from '../../../utility/constant';
import { Property } from '../../../property/property';

/**
 * Declare the struct field is used for pack all non-struct fields data into it
 */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_STRUCT}.unpack`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Relation(Visible,'call', buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, TYPE_PROVIDER, false, SCHEMA_KIND_OBJECT, SCHEMA_KIND_STRUCT))
export class Unpack extends Property<boolean> {}
