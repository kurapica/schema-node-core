import { Meta } from "../../attribute/meta";
import { Relation } from "../../attribute/relation";
import { Visible } from "../../property/common/visible";
import { Alias } from "../../property/core/alias";
import { ForSchema } from "../../property/core/forSchema";
import { OfSchema } from "../../property/core/ofSchema";
import { PropertyValueType } from "../../property/core/propertyValueType";
import { SchemaType } from "../../property/core/schemaType";
import { Property } from "../../property/property";
import { ReadOnly } from "../../property/common/readOnly";
import { buildFuncCall } from '../../schema/function/type';

import type { PropertySchema } from "./type";

import { SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_SCHEMA_PROPERTY, NS_SYSTEM_LOGIC_EQ } from "../../utility/constant";

/** The 'property' property in node schema */
@Meta(Alias, 'property')
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.prop`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_PROPERTY}.schema`)
@Meta(ReadOnly, true)
@Relation(Visible,'call', buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', SCHEMA_KIND_PROPERTY))
export class PropertyProperty extends Property<PropertySchema> {}
