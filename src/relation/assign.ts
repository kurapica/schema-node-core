import { Meta } from "../attribute/meta";
import { Relation } from "../attribute/relation";
import { ForSchema, FuncCallProperty, OfSchema, RelationKind, SchemaType, Visible } from "../property";
import { RelationProcess } from "../property/core/relationProcess";
import { getProperty } from "../property/propertyOwner";
import { IValueAccess } from "../runtime/interfaces";
import { IRelationProcess, RelationSchema } from "../schema/relationSchema";
import { NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_SCHEMA_PROPERTY_RELATION, SCHEMA_KIND_PROPERTY, SCHEMA_KIND_RELATION } from "../utility/constant";

class Assign implements IRelationProcess {
    private _value?: unknown

    load(schema: RelationSchema): void {
      this._value = getProperty(schema, AssignProperty)?.getValue();
    }

    process(owner: IValueAccess): Promise<unknown> {
      throw new Error("Method not implemented.");
    }

}

@Meta(ForSchema, SCHEMA_KIND_RELATION)
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_RELATION}.assign`)
@Meta(RelationKind, 'assign')
@Meta(RelationProcess, Assign)
@Relation(Visible, NS_SYSTEM_LOGIC_EQ, '$kind', 'assign')
class AssignProperty extends FuncCallProperty {}