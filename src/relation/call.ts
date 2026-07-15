import { Meta } from "../attribute/meta";
import { Relation } from "../attribute/relation";
import { ForSchema, FuncCall, FuncCallProperty, OfSchema, RelationKind, SchemaType, Visible } from "../property";
import { RelationProcess } from "../property/core/relationProcess";
import { getProperty } from "../property/propertyOwner";
import { IValueAccess } from "../runtime/interfaces";
import { IRelationProcess, RelationSchema } from "../schema/relationSchema";
import { NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_SCHEMA_PROPERTY_RELATION, SCHEMA_KIND_PROPERTY, SCHEMA_KIND_RELATION } from "../utility/constant";

/** The call relation process */
class CallProcess implements IRelationProcess {
    /** The function call settings */
    private _call?: FuncCall;

    load(schema: RelationSchema): void {
        this._call = getProperty(schema, Call)?.getValue();
    }

    process(owner: IValueAccess): Promise<unknown> {
        throw new Error("Method not implemented.");
    }

}

@Meta(ForSchema, SCHEMA_KIND_RELATION)
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_RELATION}.call`)
@Meta(RelationKind, 'call')
@Meta(RelationProcess, CallProcess)
@Relation(Visible, NS_SYSTEM_LOGIC_EQ, '$kind', 'call')
export class Call extends FuncCallProperty {}