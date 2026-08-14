// =============================================================================
// RelationStage — how enum values are stored
// =============================================================================

import { Meta } from "../../attribute/meta";
import { OfSchema } from '../../property/core/ofSchema';
import { SchemaType } from '../../property/core/schemaType';
import { FromEnum } from "../../property/core/fromEnum";

import { NS_SYSTEM_SCHEMA_RELATION, SCHEMA_KIND_ENUM } from "../../utility/constant";
import { RelationStage } from "./type";

/** The relation stage schema declaration */
@Meta(OfSchema, SCHEMA_KIND_ENUM)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_RELATION}.stage`)
@Meta(FromEnum, RelationStage)
class RelationStageSchema {}
