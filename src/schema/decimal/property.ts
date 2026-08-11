import { Meta } from "../../attribute/meta";
import { Relation } from "../../attribute/relation";
import { Visible } from "../../property/common/visible";
import { ForSchema } from "../../property/core/forSchema";
import { OfSchema } from "../../property/core/ofSchema";
import { PropertyValueType } from "../../property/core/propertyValueType";
import { SchemaType } from "../../property/core/schemaType";
import { buildFuncCall } from "../../property/funcCallProperty";
import { IProperty, Property } from "../../property/property";
import { combineProperties } from "../../property/propertyOwner";
import { Call } from "../../relation/call";
import { SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_LOGIC_EQ, NS_SYSTEM_SCHEMA_DECIMAL, SCHEMA_KIND_DECIMAL } from "../../utility/constant";
import { DecimalSchema } from "./type";

/** The decimal property for node schema */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.decimal`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_DECIMAL}.schema`)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', SCHEMA_KIND_DECIMAL))
export class DecimalProperty extends Property<DecimalSchema> {
  combine(other: IProperty): boolean {
    const otherSchema = other.getValue<DecimalSchema>();
    if (!otherSchema) return false;
    const selfSchema = this.getValue<DecimalSchema>();
    if (!selfSchema)
    {
      this.setValue(otherSchema);
      return true;
    }
    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_DECIMAL);
    this.setValue(selfSchema);
    return true;
  }
}
