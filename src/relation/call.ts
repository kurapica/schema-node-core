import { Meta } from "../attribute/meta";
import { Relation } from "../attribute/relation";
import { ForSchema, FuncCall, FuncCallProperty, OfSchema, RelationKind, SchemaType, Visible } from "../property";
import { RelationProcess } from "../property/core/relationProcess";
import { buildFuncCall } from "../property/funcCallProperty";
import { getProperty } from "../property/propertyOwner";
import { IErrorProvider, IValueAccess } from "../runtime/interfaces";
import { getNodeType } from "../runtime/schemaRuntime";
import { FunctionType, RelationType } from "../runtime/type";
import { IRelationProcess, RelationSchema } from "../schema/relationSchema";
import { NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_SCHEMA_PROPERTY_RELATION, SCHEMA_KIND_PROPERTY, SCHEMA_KIND_RELATION } from "../utility/constant";
import { isEmpty } from "../utility/toolset";

/** The call relation process */
class CallProcess implements IRelationProcess, IErrorProvider {
  /** The function call settings */
  private _call?: FuncCall;
  private _error?: string;
  private _func?: FunctionType;

  /** The error */
  get error() { return this._error }

  async load(schema: RelationSchema) {
    this._call = getProperty(schema, Call)?.getValue();
    this._func = this._call?.func ? await getNodeType(this._call.func) as FunctionType : undefined;
    if (!this._func)
      this._error = 'RELATION_FUNC_NOT_EXIST'; // @TODO: handle error later
  }

  attach(relation: RelationType, owner: IValueAccess, target?: IValueAccess): void {
    if (!this._func) return;
    const handler = () => relation.process(owner, target);

    // Subscribe the source node for data changes
    this._call!.args.forEach(a => {
      if (isEmpty(a.source)) return;
      const node = owner.getAccessValue(a.source!, target);
      if (!node) return;
      (target ?? owner).recordSubscription(node.subscribe(handler), relation)
    });
  }

  detach(relation: RelationType, owner: IValueAccess, target?: IValueAccess): void {
    (target ?? owner).clearSubscription(relation);
  }

  async process(owner: IValueAccess, target?: IValueAccess): Promise<unknown> {
    if (!this._func) return undefined;
    return await this._func.call(this._call!.args.map(a => {
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