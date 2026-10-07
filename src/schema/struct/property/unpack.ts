// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Unpack.cs
// =============================================================================

import { Meta } from '../../../attribute/meta';
import { Alias } from '../../../property/core/alias';
import { OfNodeKind } from '../../../property/core/ofNodeKind';
import { ForSchema } from '../../../property/core/forSchema';
import { SchemaType } from '../../../property/core/schemaType';
import { Visible } from '../../../property/common/visible';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { Relation } from '../../../attribute/relation';
import { buildFuncCall } from '../../../schema/function/type';

import { NODE_KIND_PROPERTY, SCHEMA_KIND_NODE_STRUCT_FIELD, NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_REFLECT_IS_NODE_KIND, NS_SYSTEM_SCHEMA_PRO_STRUCT, TYPE_PROVIDER, NODE_KIND_OBJECT, NODE_KIND_STRUCT } from '../../../utility/constant';
import { Property } from '../../../property/property';

/**
 * Declare the struct field is used for pack all non-struct fields data into it
 */
@Meta(Alias, 'unpack')
@Meta(ForSchema, [SCHEMA_KIND_NODE_STRUCT_FIELD])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_STRUCT}.unpack`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Relation(Visible,'call', buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_NODE_KIND, TYPE_PROVIDER, false, NODE_KIND_OBJECT, NODE_KIND_STRUCT))
export class Unpack extends Property<boolean> {}
