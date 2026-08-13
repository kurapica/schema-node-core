import { getPropertiesBySchemaKind, getPropertyValue } from "../../property/propertyOwner";
import { getNodeType } from "../../runtime/context";
import { ScalarType } from "../value/scalar";

import type { IProperty } from '../../interface';
import type { DateSchema } from "./type";

import { SCHEMA_KIND_DATE } from "../../utility/constant";

export class DateType extends ScalarType {
  private _dateSchema: DateSchema | undefined

  override get isIndexable(): boolean { return true; }

  override loadProperties(): IProperty[] {
    this._dateSchema = getPropertyValue<DateSchema>(this.schema, "date");
    return this._dateSchema ? Array.from(getPropertiesBySchemaKind(this._dateSchema, SCHEMA_KIND_DATE)) : [];
  }

  override async load() {
    this.baseType = this._dateSchema?.base
      ? await getNodeType(this._dateSchema.base) as DateType
      : undefined;
  }
}
