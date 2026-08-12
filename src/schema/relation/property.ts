import { Meta } from "../../attribute/meta";
import { OfSchema } from "../../property/core/ofSchema";
import { PropertyValueType } from "../../property/core/propertyValueType";
import { SchemaType } from "../../property/core/schemaType";
import type { IProperty } from "../../interface/valueAccess";
import { Property } from "../../property/property";
import { NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_SCHEMA_RELATION, SCHEMA_KIND_PROPERTY } from "../../utility/constant";
import type { RelationSchema } from "./type";

/** The relations property */
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.relations`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_RELATION}.schemas`)
export class Relations extends Property<RelationSchema[]> {
  combine(other: IProperty): boolean {
    const otherSchema = other.getValue<RelationSchema[]>();
    if (!otherSchema?.length) return false;
    const selfSchema = this.getValue<RelationSchema[]>() ?? [];
    if (!selfSchema.length) {
      this.setValue(otherSchema);
      return true;
    }
    otherSchema.filter(r => !selfSchema.some(s => equal(s, r))).forEach(r => selfSchema.push(r));
    this.setValue(selfSchema);
    return true;
  }
}

/** Checks if two relation schemas are equal */
function equal(a: RelationSchema, b: RelationSchema): boolean {
  return a.target === b.target && a.property === b.property && a.stage === b.stage && a.kind === b.kind;
}
