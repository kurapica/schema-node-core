import { Meta } from "../../attribute/meta";
import { Alias } from "../../property/core/alias";
import { PropertyValueType } from "../../property/core/propertyValueType";
import { ReadOnly } from "../../property/common/readOnly";
import { ForSchema } from "../../property/core/forSchema";
import { OfNodeKind } from "../../property/core/ofNodeKind";
import { SchemaType } from "../../property/core/schemaType";
import { Property } from "../../property/property";

import type { GenericParameter } from "./type";

import { SCHEMA_KIND_NODE_STRUCT, SCHEMA_KIND_NODE_ARRAY, SCHEMA_KIND_NODE_FUNCTION, NODE_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_CORE, NS_SYSTEM_LIST } from "../../utility/constant";
import { Static } from "../../property/core/static";
import { InVisible } from "../../property/common/invisible";

/**
 * A collection of generic type parameter declarations for a schema.
 */
@Meta(Alias, 'generics')
@Meta(ForSchema, [SCHEMA_KIND_NODE_STRUCT, SCHEMA_KIND_NODE_ARRAY, SCHEMA_KIND_NODE_FUNCTION])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(ReadOnly, true)
@Meta(Static, true)
@Meta(InVisible, true)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_CORE}.generics`)
@Meta(PropertyValueType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_SCHEMA_PRO_CORE}.genericParameter>`)
export class Generics extends Property<GenericParameter[]> {}
