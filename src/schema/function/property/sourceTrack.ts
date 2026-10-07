import { Property } from "../../../property/property";
import { Meta } from "../../../attribute/meta";
import { OfNodeKind } from "../../../property/core/ofNodeKind";
import { SchemaType } from "../../../property/core/schemaType";
import { PropertyValueType } from "../../../property/core/propertyValueType";
import { ForSchema } from "../../../property/core/forSchema";
import { Static } from "../../../property/core/static";

import { NODE_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_FUNC, NS_SYSTEM_BOOL, SCHEMA_KIND_NODE_FUNCTION } from "../../../utility/constant";

/** Marks a function that need track the call source node */
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(ForSchema, [SCHEMA_KIND_NODE_FUNCTION])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_FUNC}.sourcetrack`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Static, true)
export class SourceTrack extends Property<boolean> {}
