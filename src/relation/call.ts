import { Meta } from "../attribute/meta";
import { Relation } from "../attribute/relation";
import { ForSchema, FuncCall, FuncCallProperty, OfSchema, RelationKind, SchemaType, Visible } from "../property";
import { RelationProcess } from "../property/core/relationProcess";
import { buildFuncCall } from "../property/funcCallProperty";
import { getProperty } from "../property/propertyOwner";
import { IValueAccess } from "../runtime/interfaces";
import { getNodeType } from "../runtime/schemaRuntime";
import { FunctionType, RelationType } from "../runtime/type";
import { IRelationProcess, RelationSchema } from "../schema/relationSchema";
import { NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_SCHEMA_PROPERTY_RELATION, SCHEMA_KIND_PROPERTY, SCHEMA_KIND_RELATION } from "../utility/constant";
import { isEmpty } from "../utility/toolset";

/** The call relation process */
class CallProcess implements IRelationProcess {
  /** The function call settings */
  private _call?: FuncCall;

  load(schema: RelationSchema): void {
    this._call = getProperty(schema, Call)?.getValue();
  }

  attach(relation: RelationType, owner: IValueAccess, target?: IValueAccess): void {
    if (!this._call?.func) return;
    const handler = () => relation.process(owner, target);
    this._call.args.forEach(a => {
      if (isEmpty(a.source)) return;
      const node = owner.getAccessValue(a.source!, target);
      if (!node) return;
      (target ?? owner).recordSubscription(relation, node.subscribe(handler))
    });
  }

  detach(relation: RelationType, owner: IValueAccess, target?: IValueAccess): void {
    (target ?? owner).clearSubscription(relation);
  }

  async process(owner: IValueAccess, target?: IValueAccess): Promise<unknown> {
    if (!this._call?.func) return undefined;
    const func = await getNodeType(this._call.func) as FunctionType;
    if (!func) return undefined;
    return await func.call(this._call.args.map(a => {
      if (isEmpty(a.source)) return a.value;
      const node = owner.getAccessValue(a.source!, target);
      return node?.getValue();
    }));
  }
}

@Meta(ForSchema, SCHEMA_KIND_RELATION)
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_RELATION}.call`)
@Meta(RelationKind, 'call')
@Meta(RelationProcess, CallProcess)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_LOGIC_EQ, '$kind', 'call'))
export class Call extends FuncCallProperty {}