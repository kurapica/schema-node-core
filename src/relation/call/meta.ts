import { Meta } from "../../attribute/meta";
import { Relation } from "../../attribute/relation";
import { Default } from '../../property/common/default';
import { ForSchema } from '../../property/core/forSchema';
import { FuncCallProperty } from '../../property/funcCallProperty';
import { OfSchema } from '../../property/core/ofSchema';
import { RelationKind } from '../../property/record/relationKind';
import { SchemaType } from '../../property/core/schemaType';
import { Visible } from '../../property/common/visible';
import { RelationProcess } from "../../property/core/relationProcess";
import { buildFuncCall } from '../../schema/function/type';
import { NS_SYSTEM_INTRINSIC, NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_SCHEMA_PROPERTY_RELATION, SCHEMA_KIND_PROPERTY, SCHEMA_KIND_RELATION } from "../../utility/constant";
import { CallProcess } from "./type";

@Meta(ForSchema, SCHEMA_KIND_RELATION)
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_RELATION}.call`)
@Meta(RelationKind, 'call')
@Meta(RelationProcess, CallProcess)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', 'call'))
@Relation(Default, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@valueType'), "@call.return")
export class Call extends FuncCallProperty {}