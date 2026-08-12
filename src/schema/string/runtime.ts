import { UpLimitString } from "../../property/constraint/upLimit";
import { type IProperty } from "../../interface";
import { getPropertiesBySchemaKind, getPropertyValue } from "../../property/propertyOwner";
import { getNodeType } from "../../runtime/context";
import { ENTITY_PRIMARY_KEY_MAX_LEN, SCHEMA_KIND_STRING } from "../../utility/constant";
import { ScalarType } from "../value/scalar";
import type { StringSchema } from "./type";

export class StringType extends ScalarType {
  private _stringSchema: StringSchema | undefined;

  override get isIndexable(): boolean {
    const uplimit = this.getProperty(UpLimitString);
    return uplimit?.hasValue && uplimit.getValue<number>()! < ENTITY_PRIMARY_KEY_MAX_LEN ? true : false; 
  }

  override loadProperties(): IProperty[] {
    this._stringSchema = getPropertyValue<StringSchema>(this.schema, "string");
    return this._stringSchema ? Array.from(getPropertiesBySchemaKind(this._stringSchema, SCHEMA_KIND_STRING)) : [];
  }

  override async load() {
    this.baseType = this._stringSchema?.base
      ? await getNodeType(this._stringSchema.base) as StringType
      : undefined;
  }
}
