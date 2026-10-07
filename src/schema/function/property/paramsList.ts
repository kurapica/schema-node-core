import { Meta } from "../../../attribute/meta";
import { InVisible } from "../../../property";
import { ForSchema } from "../../../property/core/forSchema";
import { OfNodeKind } from "../../../property/core/ofNodeKind";
import { PropertyValueType } from "../../../property/core/propertyValueType";
import { SchemaType } from "../../../property/core/schemaType";
import { Property } from "../../../property/property";
import type { Entry } from "../../../struct/entry/type";

import { SCHEMA_KIND_NODE_FUNC_ARG, NODE_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_FUNC, NS_SYSTEM_LIST, NS_SYSTEM_ENTRY, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE } from "../../../utility";

/** The params list */
@Meta(ForSchema, [SCHEMA_KIND_NODE_FUNC_ARG])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_FUNC}.paramsList`)
@Meta(PropertyValueType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_ENTRY}<${NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE}>>`)
@Meta(InVisible, true) // Hide for design now
export class ParamsList extends Property<Entry<string>[]>{}
