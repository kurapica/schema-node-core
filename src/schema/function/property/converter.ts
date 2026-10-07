import { Property } from "../../../property/property";
import { Meta } from "../../../attribute/meta";
import { Alias } from "../../../property/core/alias";
import { OfNodeKind } from "../../../property/core/ofNodeKind";
import { SchemaType } from "../../../property/core/schemaType";
import { PropertyValueType } from "../../../property/core/propertyValueType";

import { NODE_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_FUNC, NS_SYSTEM_BOOL } from "../../../utility/constant";
import { InVisible } from "../../../property";

@Meta(Alias, 'converter')
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_FUNC}.converter`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(InVisible, true)
export class Converter extends Property<boolean> {}
