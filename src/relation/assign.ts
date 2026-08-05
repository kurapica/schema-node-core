import { Meta } from "../attribute/meta";
import { Relation } from "../attribute/relation";
import { ForSchema, FuncCallProperty, OfSchema, OverrideType, Property, RelationKind, SchemaType, Visible } from "../property";
import { RelationProcess } from "../property/core/relationProcess";
import { buildFuncCall } from "../property/funcCallProperty";
import { getProperty } from "../property/propertyOwner";
import { IValueAccess } from "../runtime/interfaces";
import { RelationType } from "../runtime/type";
import { IRelationProcess, RelationSchema } from "../schema/relationSchema";
import { NS_SYSTEM_INTRINSIC, NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_SCHEMA_PROPERTY_RELATION, NS_SYSTEM_SCHEMA_REFLECT_PROPERTY, SCHEMA_KIND_PROPERTY, SCHEMA_KIND_RELATION } from "../utility/constant";
import { Call } from "./call";

/** The assign relation process */
export class AssignProcess implements IRelationProcess {
    private _value?: unknown

    async load(schema: RelationSchema) {
      this._value = getProperty(schema, Assign)?.getValue();
    }

    attach(relation: RelationType, owner: IValueAccess, target?: IValueAccess): void {}
    detach(relation: RelationType, owner: IValueAccess, target?: IValueAccess): void {}
    async process(owner: IValueAccess, target?: IValueAccess): Promise<unknown> {
      return this._value;
    }

}

@Meta(ForSchema, SCHEMA_KIND_RELATION)
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_RELATION}.assign`)
@Meta(RelationKind, 'assign')
@Meta(RelationProcess, AssignProcess)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', 'assign'))
@Relation(OverrideType, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@valueType'))
export class Assign extends Property<unknown> {}