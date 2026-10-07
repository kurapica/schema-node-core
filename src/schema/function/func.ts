import { Meta } from "../../attribute/meta";
import { Relation } from "../../attribute/relation";
import { Visible } from "../../property/common/visible";
import { ForSchema } from "../../property/core/forSchema";
import { OfNodeKind } from "../../property/core/ofNodeKind";
import { PropertyValueType } from "../../property/core/propertyValueType";
import { SchemaType } from "../../property/core/schemaType";
import { buildFuncCall } from '../../schema/function/type';
import { Property } from "../../property/property";
import { combineProperties } from "../../property/propertyOwner";

import type { IProperty } from "../../interface";
import type { FunctionSchema } from "./type";

import { SCHEMA_KIND_NODE, NODE_KIND_PROPERTY, NS_SYSTEM_SCHEMA_FUNC, NS_SYSTEM_LOGIC_EQ, SCHEMA_KIND_NODE_FUNCTION, SCHEMA_KIND_NODE_FUNC_ARG, NS_SYSTEM_SCHEMA_PRO_FUNC, NODE_KIND_FUNCTION } from "../../utility/constant";

/** The function property for node schemas. */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_FUNC}.${NODE_KIND_FUNCTION}`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_FUNC}.schema`)
@Relation(Visible, 'call', buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', NODE_KIND_FUNCTION))
export class FunctionProperty extends Property<FunctionSchema> {
  combine(other: IProperty): boolean {
    const otherSchema = other?.getValue<FunctionSchema>();
    if (!otherSchema) return false;
    const selfSchema = this.getValue<FunctionSchema>();
    if (!selfSchema) {
      this.setValue(otherSchema);
      return true;
    }

    // Combine argument display
    for (let i = 0; i < Math.min(selfSchema.args.length, otherSchema.args.length); i++) {
      const arg = selfSchema.args[i];
      const otherArg = otherSchema.args[i];
      if (!otherArg || otherArg.type !== arg.type) continue;
      combineProperties(arg, otherArg, SCHEMA_KIND_NODE_FUNC_ARG);
    }

    // Combine properties
    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_NODE_FUNCTION);
    this.setValue(selfSchema);
    
    return true;
  }
}