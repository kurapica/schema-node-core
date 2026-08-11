// =============================================================================
// EnumValueType — how enum values are stored
// =============================================================================

import { Meta } from "../attribute/meta";
import { OfSchema } from '../property/core/ofSchema';
import { SchemaType } from '../property/core/schemaType';
import { FromEnum } from "../property/core/fromEnum";
import { NS_SYSTEM_SCHEMA_ENUM, SCHEMA_KIND_ENUM } from "../utility/constant";

/** The enum value type */
export enum EnumValueType {
  String = 'string',
  Int = 'int',
  Flags = 'flags',
}

/** The enum value type values */
export type EnumValueTypeValue = `${EnumValueType}`;

/** The enum value type schema declaration */
@Meta(OfSchema, SCHEMA_KIND_ENUM)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_ENUM}.valuetype`)
@Meta(FromEnum, EnumValueType)
class EnumValueTypeSchema {}