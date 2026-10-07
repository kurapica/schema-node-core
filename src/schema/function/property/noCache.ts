import { Property } from "../../../property/property";
import { Meta } from "../../../attribute/meta";
import { Alias } from "../../../property/core/alias";
import { OfNodeKind } from "../../../property/core/ofNodeKind";
import { SchemaType } from "../../../property/core/schemaType";
import { PropertyValueType } from "../../../property/core/propertyValueType";

import { NODE_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_FUNC, NS_SYSTEM_BOOL, SCHEMA_KIND_NODE_FUNCTION } from "../../../utility/constant";
import { Static } from "../../../property/core/static";
import { ReadOnly } from "../../../property/common/readOnly";
import { InVisible } from "../../../property/common/invisible";
import { ForSchema } from "../../../property/core/forSchema";

@Meta(Alias, 'noCache')
@Meta(ForSchema, SCHEMA_KIND_NODE_FUNCTION)
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_FUNC}.nocache`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
export class NoCache extends Property<boolean> {}
