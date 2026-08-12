import type { IProperty } from "../../interface";
import { getPropertiesBySchemaKind, getPropertyValue } from "../../property/propertyOwner";
import { getNodeType } from "../../runtime/context";
import { SCHEMA_KIND_DECIMAL } from "../../utility/constant";
import { ScalarType } from "../value/scalar";
import type { DecimalSchema } from "./type";

export class DecimalType extends ScalarType {
  private _decimalSchema: DecimalSchema | undefined

  override loadProperties(): IProperty[] {
    this._decimalSchema = getPropertyValue<DecimalSchema>(this.schema, "decimal");
    return this._decimalSchema ? Array.from(getPropertiesBySchemaKind(this._decimalSchema, SCHEMA_KIND_DECIMAL)) : [];
  }

  override async load() {
    this.baseType = this._decimalSchema?.base
      ? await getNodeType(this._decimalSchema.base) as DecimalType
      : undefined;
  }  
}
