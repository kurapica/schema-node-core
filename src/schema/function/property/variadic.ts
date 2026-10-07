import { Property } from "../../../property/property";
import { Meta } from "../../../attribute/meta";
import { Alias } from "../../../property/core/alias";
import { OfNodeKind } from "../../../property/core/ofNodeKind";
import { SchemaType } from "../../../property/core/schemaType";
import { PropertyValueType } from "../../../property/core/propertyValueType";
import { ForSchema } from "../../../property/core/forSchema";

import { NODE_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_FUNC, NS_SYSTEM_BOOL, SCHEMA_KIND_NODE_FUNC_ARG } from "../../../utility/constant";

@Meta(Alias, 'variadic')
@Meta(ForSchema, [SCHEMA_KIND_NODE_FUNC_ARG])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_FUNC}.variadic`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
export class Variadic extends Property<boolean> {};