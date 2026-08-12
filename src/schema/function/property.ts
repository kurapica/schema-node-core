import { Meta } from "../../attribute/meta";
import { Relation } from "../../attribute/relation";
import { Visible } from "../../property/common/visible";
import { ForSchema } from "../../property/core/forSchema";
import { OfSchema } from "../../property/core/ofSchema";
import { PropertyValueType } from "../../property/core/propertyValueType";
import { SchemaType } from "../../property/core/schemaType";
import { buildFuncCall } from '../../schema/function/type';
import type { IProperty } from "../../interface/valueAccess";
import { Property } from "../../property/property";
import { combineProperties } from "../../property/propertyOwner";
import { Call } from "../../relation/call/meta";
import { SCHEMA_KIND_NODE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CORE, NS_SYSTEM_SCHEMA_FUNC, NS_SYSTEM_LOGIC_EQ, SCHEMA_KIND_FUNCTION, SCHEMA_KIND_FUNC_ARG } from "../../utility/constant";
import type { FunctionSchema } from "./type";

/** The function property for node schemas. */
@Meta(ForSchema, [SCHEMA_KIND_NODE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CORE}.func`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_FUNC}.schema`)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_LOGIC_EQ, '@kind', SCHEMA_KIND_FUNCTION))
export class FuncProperty extends Property<FunctionSchema> {
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
      combineProperties(arg, otherArg, SCHEMA_KIND_FUNC_ARG);
    }

    // Combine properties
    combineProperties(selfSchema, otherSchema, SCHEMA_KIND_FUNCTION);
    this.setValue(selfSchema);
    return true;
  }
}