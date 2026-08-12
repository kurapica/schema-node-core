import { Meta } from "../../attribute/meta";
import { Relation } from "../../attribute/relation";
import { Default } from "../../property/common/default";
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
import { SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_SCHEMA_ARRAY, NS_SYSTEM_LOGIC_EQ, SCHEMA_KIND_ARRAY, NS_SYSTEM_SCHEMA_REFLECT_ARRAY } from "../../utility/constant";
import type { ArraySchema } from "./type";

/** The array property for node schema */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.array`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_ARRAY}.schema`)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', SCHEMA_KIND_ARRAY))
@Relation(Default, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.genarrayname`, "@array.element"), "name")
@Relation(Default, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.genarraydisplay`, "@array.element"), "display.key")
export class ArrayProperty extends Property<ArraySchema> {
  combine(other: IProperty): boolean {
    const otherSchema = other.getValue<ArraySchema>();
    if (!otherSchema) return false;
    const selfSchema = this.getValue<ArraySchema>();
    if (!selfSchema)
    {
      this.setValue(otherSchema);
      return true;
    }
    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_ARRAY);
    this.setValue(selfSchema);
    return true;
  }
}