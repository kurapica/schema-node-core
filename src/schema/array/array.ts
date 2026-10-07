import { Meta } from "../../attribute/meta";
import { Relation } from "../../attribute/relation";
import { Alias } from "../../property/core/alias";
import { Default } from "../../property/common/default";
import { Visible } from "../../property/common/visible";
import { ForSchema } from "../../property/core/forSchema";
import { OfNodeKind } from "../../property/core/ofNodeKind";
import { PropertyValueType } from "../../property/core/propertyValueType";
import { SchemaType } from "../../property/core/schemaType";
import { buildFuncCall } from '../../schema/function/type';
import { Property } from "../../property/property";
import { combineProperties } from "../../property/propertyOwner";

import type { IProperty } from '../../interface';
import type { ArraySchema } from "./type";

import { SCHEMA_KIND_NODE, NODE_KIND_PROPERTY, NS_SYSTEM_SCHEMA_ARRAY, NS_SYSTEM_LOGIC_EQ, SCHEMA_KIND_NODE_ARRAY, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, NS_SYSTEM_SCHEMA_PRO_ARRAY, NODE_KIND_ARRAY } from "../../utility/constant";

/** The array property for node schema */
@Meta(Alias, 'array')
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_ARRAY}.${NODE_KIND_ARRAY}`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_ARRAY}.schema`)
@Relation(Visible,'call', buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', NODE_KIND_ARRAY))
@Relation(Default,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.genarrayname`, "@array.element"), "name")
@Relation(Default,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.genarraydisplay`, "@array.element"), "display.key")
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
    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_NODE_ARRAY);
    this.setValue(selfSchema);
    return true;
  }
}