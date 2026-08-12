import type { IRelation, IValueAccess } from "../../interface/valueAccess";
import { getPropertyValue } from "../../property/propertyOwner";
import type { IRelationProcess } from "../../schema/relation/interface";
import type { RelationSchema } from "../../schema/relation/type";

/** The assign relation process */
export class AssignProcess implements IRelationProcess {
    private _value?: unknown

    async load(schema: RelationSchema) {
      this._value = getPropertyValue<unknown>(schema, 'assign');
    }

    attach(relation: IRelation, owner: IValueAccess, target?: IValueAccess): void {}
    detach(relation: IRelation, owner: IValueAccess, target?: IValueAccess): void {}
    async process(owner: IValueAccess, target?: IValueAccess): Promise<unknown> {
      return this._value;
    }
}