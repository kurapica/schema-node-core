import { Meta, Relation } from "../../attribute";
import { Visible } from "../../property/common/visible";
import { ForSchema } from "../../property/core/forSchema";
import { OfSchema } from "../../property/core/ofSchema";
import { PropertyValueType } from "../../property/core/propertyValueType";
import { SchemaType } from "../../property/core/schemaType";
import { buildFuncCall } from '../../schema/function/type';
import { Property } from "../../property/property";
import { combineProperties } from "../../property/propertyOwner";
import { concatLocaleString } from "../../struct/localeString/type";

import type { IProperty } from "../../interface";
import type { EnumSchema } from "./type";

import { SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_ENUM, NS_SYSTEM_SCHEMA_ENUM, NS_SYSTEM_LOGIC_EQ, SCHEMA_KIND_ENUM, SCHEMA_KIND_ENTRY } from "../../utility/constant";

/** The enum property of node schema */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_ENUM}.${SCHEMA_KIND_ENUM}`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_ENUM}.schema`)
@Relation(Visible,'call', buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', SCHEMA_KIND_ENUM))
export class EnumProperty extends Property<EnumSchema> {
  combine(other: IProperty): boolean {
    const otherSchema = other?.getValue<EnumSchema>();
    if (!otherSchema) return false;
    const selfSchema = this.getValue<EnumSchema>();
    if (!selfSchema)
    {
      this.setValue(otherSchema);
      return true;
    }

    // combine cascade
    if (selfSchema.cascade?.length && otherSchema.cascade?.length)
    {
      for (let i = 0; i < Math.min(selfSchema.cascade.length, otherSchema.cascade.length); i++)
        selfSchema.cascade[i] = concatLocaleString(selfSchema.cascade[i], otherSchema.cascade[i]);
    }

    // combine enum values
    for (let i = 0; i < Math.min(selfSchema.values.length, otherSchema.values.length); i++)
      combineProperties(selfSchema.values[i], otherSchema.values[i], SCHEMA_KIND_ENTRY);

    // combine properties
    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_ENUM);
    this.setValue(selfSchema);
    return true;
  }
}