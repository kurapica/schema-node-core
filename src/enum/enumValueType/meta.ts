// =============================================================================
// EnumValueType — how enum values are stored
// =============================================================================

import { Meta } from "../../attribute/meta";
import { OfNodeKind } from '../../property/core/ofNodeKind';
import { SchemaType } from '../../property/core/schemaType';
import { FromEnum } from "../../property/core/fromEnum";

import { NS_SYSTEM_SCHEMA_ENUM, NODE_KIND_ENUM } from "../../utility/constant";
import { EnumValueType } from "./type";

/** The enum value type schema declaration */
@Meta(OfNodeKind, NODE_KIND_ENUM)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.valuetype`)
@Meta(FromEnum, EnumValueType)
class EnumValueTypeSchema {}