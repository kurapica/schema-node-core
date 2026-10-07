import { Meta, Relation } from "../../attribute";
import { Visible } from "../../property/common/visible";
import { ForSchema } from "../../property/core/forSchema";
import { OfNodeKind } from "../../property/core/ofNodeKind";
import { PropertyValueType } from "../../property/core/propertyValueType";
import { SchemaType } from "../../property/core/schemaType";
import { buildFuncCall } from '../../schema/function/type';
import { Property } from "../../property/property";
import { combineProperties } from "../../property/propertyOwner";

import type { IProperty } from "../../interface";
import type { StructSchema, StructFieldSchema } from "./type";

import { SCHEMA_KIND_NODE, NODE_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_STRUCT, NS_SYSTEM_SCHEMA_STRUCT, NS_SYSTEM_LOGIC_EQ, SCHEMA_KIND_NODE_STRUCT, SCHEMA_KIND_NODE_STRUCT_FIELD, NODE_KIND_STRUCT } from "../../utility";

/** Property bridge. */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_STRUCT}.${NODE_KIND_STRUCT}`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_STRUCT}.schema`)
@Relation(Visible,'call', buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', NODE_KIND_STRUCT))
export class StructProperty extends Property<StructSchema> {
  combine(other: IProperty): boolean {
    const otherSchema = other?.getValue<StructSchema>();
    if (!otherSchema) return false;
    const selfSchema = this.getValue<StructSchema>();
    if (!selfSchema)
    {
      this.setValue(otherSchema);
      return true;
    }

    // combine fields
    const combineFields : StructFieldSchema[] = []
    const matched = new Set<string>();
    for (let i = 0; i < otherSchema.fields.length; i++)
    {
      const otherField = otherSchema.fields[i];
      const name = otherField.name.toLowerCase();
      if (matched.has(name)) continue;
      matched.add(name);

      const index = selfSchema.fields.findIndex(f => f.name.toLowerCase() === name);
      if (index >= 0)
      {
        for (let j = 0; j < index; j++)
        {
          const existField = selfSchema.fields[j];
          const ename = existField.name.toLowerCase();
          if (otherSchema.fields.findIndex(f => f.name.toLowerCase() === ename) < 0 && !matched.has(ename))
          {
            matched.add(ename);
            combineFields.push(existField);
          }
        }
        combineFields.push(combineProperties(selfSchema.fields[index], otherField, SCHEMA_KIND_NODE_STRUCT_FIELD));
      }
      else
        combineFields.push(otherField);
    }
    combineFields.push(...selfSchema.fields.filter(f => !matched.has(f.name.toLowerCase())))
    selfSchema.fields = combineFields;

    // combine properties
    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_NODE_STRUCT);
    this.setValue(selfSchema);
    return true;
  }
}
