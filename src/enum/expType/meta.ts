// =============================================================================
// ExpType — how enum values are stored
// =============================================================================

import { Meta } from "../../attribute/meta";
import { OfSchema } from '../../property/core/ofSchema';
import { SchemaType } from '../../property/core/schemaType';
import { FromEnum } from "../../property/core/fromEnum";

import { NS_SYSTEM_SCHEMA_FUNC, SCHEMA_KIND_ENUM } from "../../utility/constant";
import { ExpType } from "./type";

/** The exp type schema declaration */
@Meta(OfSchema, SCHEMA_KIND_ENUM)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_FUNC}.exptype`)
@Meta(FromEnum, ExpType)
class ExpTypeSchema {}
