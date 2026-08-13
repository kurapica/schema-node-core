import { Meta } from "../../attribute/meta";
import { Relation } from "../../attribute/relation";
import { ForSchema } from '../../property/core/forSchema';
import { OfSchema } from '../../property/core/ofSchema';
import { OverrideType } from '../../property/core/overrideType';
import { Property } from '../../property/property';
import { RelationKind } from '../../property/record/relationKind';
import { SchemaType } from '../../property/core/schemaType';
import { Visible } from '../../property/common/visible';
import { RelationProcess } from "../../property/core/relationProcess";
import { buildFuncCall } from '../../schema/function/type';
import { AssignProcess } from "./type";
import { PropertyValueType } from "../../property";

import { NS_SYSTEM_INTRINSIC, NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_OBJECT, NS_SYSTEM_SCHEMA_PROPERTY_RELATION, SCHEMA_KIND_PROPERTY, SCHEMA_KIND_RELATION } from "../../utility/constant";

@Meta(ForSchema, SCHEMA_KIND_RELATION)
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_RELATION}.assign`)
@Meta(PropertyValueType, NS_SYSTEM_OBJECT)
@Meta(RelationKind, 'assign')
@Meta(RelationProcess, AssignProcess)
@Relation(Visible,'call', buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', 'assign'))
@Relation(OverrideType,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@valueType'))
export class Assign extends Property<unknown> {}