import { Property } from "..";
import { Meta } from "../../attribute";
import { StructNode } from "../../node";
import { IValueAccess } from "../../runtime/interfaces";
import { SCHEMA_KIND_ENUM, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_BOOL } from "../../utility";
import { InVisible, Default } from "../common";
import { IConstraintProperty } from "../constraintProperty";
import { Alias, ForSchema, OfSchema, SchemaType, PropertyValueType, Static } from "../core";

@Meta(Alias, 'struct')
@Meta(ForSchema, [SCHEMA_KIND_ENUM])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.struct`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(InVisible, true)
@Meta(Default, true)
@Meta(Static, true)
export class StructValue extends Property<boolean> implements IConstraintProperty {
  override get hasValue(): boolean { return true; }

  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node instanceof StructNode)
    {
      for (const field of node.fields)
        await field.validate();
      return undefined;
    }
    return undefined;
  }
}
