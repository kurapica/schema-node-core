import { Meta } from "../../attribute/meta";
import { Relation } from "../../attribute/relation";
import { Visible } from "../../property/common/visible";
import { Alias } from "../../property/core/alias";
import { ForSchema } from "../../property/core/forSchema";
import { OfNodeKind } from "../../property/core/ofNodeKind";
import { PropertyValueType } from "../../property/core/propertyValueType";
import { SchemaType } from "../../property/core/schemaType";
import { Property } from "../../property/property";
import { ReadOnly } from "../../property/common/readOnly";
import { buildFuncCall } from '../../schema/function/type';

import type { PropertySchema } from "./type";

import { SCHEMA_KIND_NODE, NS_SYSTEM_SCHEMA_PRO, NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_SCHEMA_PRO_PROPERTY, NODE_KIND_PROPERTY } from "../../utility/constant";

/** The 'property' property in node schema */
@Meta(Alias, 'property')
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_PROPERTY}.${NODE_KIND_PROPERTY}`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_PRO}.schema`)
@Meta(ReadOnly, true)
@Relation(Visible,'call', buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', NODE_KIND_PROPERTY))
export class PropertyProperty extends Property<PropertySchema> {}
