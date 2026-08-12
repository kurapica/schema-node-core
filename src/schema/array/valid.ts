import { Meta } from "../../attribute/meta";
import { Default } from "../../property/common/default";
import { InVisible } from "../../property/common/invisible";
import { Alias } from "../../property/core/alias";
import { ForSchema } from "../../property/core/forSchema";
import { OfSchema } from "../../property/core/ofSchema";
import { PropertyValueType } from "../../property/core/propertyValueType";
import { SchemaType } from "../../property/core/schemaType";
import { Static } from "../../property/core/static";
import { Error } from "../../property/common/error";
import { ConstraintProperty } from "../../property/constraintProperty";
import type { IValueAccess } from "../../interface/valueAccess";
import { ArrayNode } from "./node";
import { SCHEMA_KIND_ARRAY, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_BOOL } from "../../utility/constant";

@Meta(Alias, 'array')
@Meta(ForSchema, [SCHEMA_KIND_ARRAY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.array`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(InVisible, true)
@Meta(Default, true)
@Meta(Static, true)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.array.error`)
export class ArrayValue extends ConstraintProperty<boolean> {
  override get hasValue(): boolean { return true; }

  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node instanceof ArrayNode)
    {
      for (const element of node.elements)
        await element.validate();
      return undefined;
    }
    return undefined;
  }
}
