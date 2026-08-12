import type { IPropertyProvider } from "../../interface/propertyProvider";
import type { IValueAccess } from "../../interface/valueAccess";
import type { IProperty } from '../../interface/valueAccess';
import { getPropertiesBySchemaKind, getPropertyValue } from "../../property/propertyOwner";
import { getNodeType } from "../../runtime/context";
import { SCHEMA_KIND_DATE } from "../../utility/constant";
import { ScalarType } from "../value/scalar";
import { DateNode } from "./node";
import type { DateSchema } from "./type";

export class DateType extends ScalarType {
  private _dateSchema: DateSchema | undefined

  override create(value: unknown, parent?: IValueAccess, propProvider?: IPropertyProvider): DateNode { return new DateNode(this, value, parent, propProvider); }

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
