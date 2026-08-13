import { Meta } from "../../attribute/meta";
import { Relation } from "../../attribute/relation";
import { Visible } from "../../property/common/visible";
import { ForSchema } from "../../property/core/forSchema";
import { OfSchema } from "../../property/core/ofSchema";
import { PropertyValueType } from "../../property/core/propertyValueType";
import { SchemaType } from "../../property/core/schemaType";
import { buildFuncCall } from '../../schema/function/type';
import { type IProperty } from "../../interface";
import { Property } from "../../property/property";
import { combineProperties } from "../../property/propertyOwner";
import { SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_SCHEMA_STRING, SCHEMA_KIND_STRING } from "../../utility/constant";
import type { StringSchema } from "./type";

/** The date property for node schema */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.string`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_STRING}.schema`)
@Relation(Visible,'call', buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', SCHEMA_KIND_STRING))
export class StringProperty extends Property<StringSchema>
{
  combine(other: IProperty): boolean {
    const otherSchema = other.getValue<StringSchema>();
    if (!otherSchema) return false;
    const selfSchema = this.getValue<StringSchema>();
    if (!selfSchema)
    {
      this.setValue(otherSchema);
      return true;
    }
    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_STRING);
    this.setValue(selfSchema);
    return true;
  }
}