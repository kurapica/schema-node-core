// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/AsSuggest.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { ForSchema } from '../core/forSchema';
import { buildFuncCall } from '../../schema/function/type';
import { Visible } from './visible';
import { InVisible } from './invisible';
import { NS_SYSTEM_BOOL, NS_SYSTEM_LOGIC, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_ENUM, SCHEMA_KIND_INT, SCHEMA_KIND_PROPERTY, SCHEMA_KIND_STRING, SCHEMA_KIND_STRUCT_FIELD } from '../../utility/constant';
import { Relation } from '../../attribute/relation';
import { Call } from '../../relation/call/meta';

/** The entry list or white list only used as suggestion */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.asSuggest`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, "@type", true, SCHEMA_KIND_ENUM, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING))
@Relation(InVisible, Call, buildFuncCall(`${NS_SYSTEM_LOGIC}.isempty`, "@whiteList"))
export class AsSuggest extends Property<boolean>{}
