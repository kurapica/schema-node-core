import { getPropertiesBySchemaKind, getPropertyValue } from "../../property/propertyOwner";
import { getNodeType } from "../../runtime/context";
import { ScalarType } from "../value/scalar";

import type { IProperty } from "../../interface";
import type { IntSchema } from "./type";

import { SCHEMA_KIND_INT } from "../../utility/constant";

export class IntType extends ScalarType {
  private _intSchema: IntSchema | undefined
  
  override get isIndexable(): boolean { return true; }

  override loadProperties(): IProperty[] {
    this._intSchema = getPropertyValue<IntSchema>(this.schema, "int");
    return this._intSchema ? Array.from(getPropertiesBySchemaKind(this._intSchema, SCHEMA_KIND_INT)) : [];
  }

  override async load() {
    this.baseType = this._intSchema?.base
      ? await getNodeType(this._intSchema.base) as IntType
      : undefined;
  }
}
