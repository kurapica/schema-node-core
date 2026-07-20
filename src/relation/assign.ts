import { Meta } from "../attribute/meta";
import { Relation } from "../attribute/relation";
import { ForSchema, FuncCallProperty, OfSchema, RelationKind, SchemaType, Visible } from "../property";
import { RelationProcess } from "../property/core/relationProcess";
import { buildFuncCall } from "../property/funcCallProperty";
import { getProperty } from "../property/propertyOwner";
import { IValueAccess } from "../runtime/interfaces";
import { RelationType } from "../runtime/type";
import { IRelationProcess, RelationSchema } from "../schema/relationSchema";
import { NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_SCHEMA_PROPERTY_RELATION, SCHEMA_KIND_PROPERTY, SCHEMA_KIND_RELATION } from "../utility/constant";
import { Call } from "./call";

class Assign implements IRelationProcess {
    private _value?: unknown

    async load(schema: RelationSchema) {
      this._value = getProperty(schema, AssignProperty)?.getValue();
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
@Meta(RelationProcess, Assign)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', 'assign'))
class AssignProperty extends FuncCallProperty {}