import { Property } from "..";
import { Meta } from "../../attribute";
import { ArrayNode } from "../../node";
import { IValueAccess } from "../../runtime/interfaces";
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_BOOL, SCHEMA_KIND_ARRAY } from "../../utility";
import { InVisible, Default, Error } from "../common";
import { IConstraintProperty } from "../constraintProperty";
import { Alias, ForSchema, OfSchema, SchemaType, PropertyValueType, Static } from "../core";

@Meta(Alias, 'array')
@Meta(ForSchema, [SCHEMA_KIND_ARRAY])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.array`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(InVisible, true)
@Meta(Default, true)
@Meta(Static, true)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.array.error`)
export class ArrayValue extends Property<boolean> implements IConstraintProperty {
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
