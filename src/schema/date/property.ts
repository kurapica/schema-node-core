import { Meta } from "../../attribute/meta";
import { Relation } from "../../attribute/relation";
import { Visible } from "../../property/common/visible";
import { ForSchema } from "../../property/core/forSchema";
import { OfSchema } from "../../property/core/ofSchema";
import { PropertyValueType } from "../../property/core/propertyValueType";
import { SchemaType } from "../../property/core/schemaType";
import { buildFuncCall } from '../../schema/function/type';
import type { IProperty } from '../../interface';
import { Property } from "../../property/property";
import { combineProperties } from "../../property/propertyOwner";
import { Call } from "../../relation/call/meta";
import { SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_SCHEMA_DATE, NS_SYSTEM_LOGIC_EQ, SCHEMA_KIND_DATE } from "../../utility/constant";
import type { DateSchema } from "./type";

/** The date property for node schema */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.date`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_DATE}.schema`)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', SCHEMA_KIND_DATE))
export class DateProperty extends Property<DateSchema>
{
  combine(other: IProperty): boolean {
    const otherSchema = other.getValue<DateSchema>();
    if (!otherSchema) return false;
    const selfSchema = this.getValue<DateSchema>();
    if (!selfSchema)
    {
      this.setValue(otherSchema);
      return true;
    }
    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_DATE);
    this.setValue(selfSchema);
    return true;
  }
}