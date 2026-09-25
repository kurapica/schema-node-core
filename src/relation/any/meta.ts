import { Meta } from "../../attribute/meta";
import { Relation } from "../../attribute/relation";
import { ForSchema } from '../../property/core/forSchema';
import { OfSchema } from '../../property/core/ofSchema';
import { RelationKind } from '../../property/record/relationKind';
import { SchemaType } from '../../property/core/schemaType';
import { RelationProcess } from "../../property/core/relationProcess";
import { buildFuncCall, type FuncCall } from '../../schema/function/type';
import { AnyProcess } from "./type";
import { PropertyValueType } from "../../property/core/propertyValueType";

import { NS_SYSTEM_LIST, NS_SYSTEM_LOGIC,  NS_SYSTEM_SCHEMA_FUNC, NS_SYSTEM_SCHEMA_FUNC_CALL, NS_SYSTEM_SCHEMA_PRO_COMMON, NS_SYSTEM_SCHEMA_PRO_RELATION, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_BOOL, SCHEMA_KIND_PROPERTY, SCHEMA_KIND_RELATION } from "../../utility/constant";
import { Property } from "../../property";

@Meta(ForSchema, SCHEMA_KIND_RELATION)
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_RELATION}.any`)
@Meta(PropertyValueType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_SCHEMA_FUNC_CALL}<{${NS_SYSTEM_SCHEMA_FUNC}.valid>>`)
@Meta(RelationKind, 'any')
@Meta(RelationProcess, AnyProcess)
@Relation(`${NS_SYSTEM_SCHEMA_PRO_COMMON}.invisible`,'call', buildFuncCall(`${NS_SYSTEM_LOGIC}.neq`, '@kind', 'any'))
@Relation(`${NS_SYSTEM_SCHEMA_PRO_COMMON}.visible`,'call', buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, '@valueType', SCHEMA_KIND_BOOL))
export class Any extends Property<FuncCall[]> {}