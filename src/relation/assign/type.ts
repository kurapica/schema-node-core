import { getPropertyValue } from "../../property/propertyOwner";

import type { IRelation, IValueAccess } from "../../interface";
import type { IRelationProcess } from "../../schema/relation/interface";
import type { RelationSchema } from "../../schema/relation/type";
import { deepClone } from "../../utility/toolset";

/** The assign relation process */
export class AssignProcess implements IRelationProcess {
  private _value?: unknown

  /** The assign value. */
  get value(): unknown { return deepClone(this._value); }

  async load(schema: RelationSchema) {
    this._value = getPropertyValue<unknown>(schema, 'assign');
  }

  attach(relation: IRelation, owner: IValueAccess, target: IValueAccess): void {}

  detach(relation: IRelation, owner: IValueAccess, target: IValueAccess): void {}
  
  async process(owner: IValueAccess, target: IValueAccess): Promise<unknown> {
    return this._value;
  }
}