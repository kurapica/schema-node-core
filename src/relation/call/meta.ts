import { Meta } from "../../attribute/meta";
import { Relation } from "../../attribute/relation";
import { ForSchema } from '../../property/core/forSchema';
import { FuncCallProperty } from '../../property/funcCallProperty';
import { OfSchema } from '../../property/core/ofSchema';
import { RelationKind } from '../../property/record/relationKind';
import { SchemaType } from '../../property/core/schemaType';
import { RelationProcess } from "../../property/core/relationProcess";
import { buildFuncCall } from '../../schema/function/type';
import { CallProcess } from "./type";
import { PropertyValueType } from "../../property/core/propertyValueType";

import { NS_SYSTEM_INTRINSIC, NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_SCHEMA_FUNC, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_SCHEMA_PROPERTY_RELATION, SCHEMA_KIND_PROPERTY, SCHEMA_KIND_RELATION } from "../../utility/constant";

@Meta(ForSchema, SCHEMA_KIND_RELATION)
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_RELATION}.call`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_FUNC}.funccall`)
@Meta(RelationKind, 'call')
@Meta(RelationProcess, CallProcess)
@Relation(`${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.visible`,'call', buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', 'call'))
@Relation(`${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.default`,'call', buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@valueType'), "@call.return")
export class Call extends FuncCallProperty {}