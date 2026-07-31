import { Property } from "..";
import { Meta } from "../../attribute";
import { IValueAccess } from "../../runtime/interfaces";
import { SCHEMA_KIND_INT, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_BOOL, isNull } from "../../utility";
import { InVisible, Default } from "../common";
import { IConstraintProperty } from "../constraintProperty";
import { Alias, ForSchema, OfSchema, SchemaType, PropertyValueType, Static } from "../core";
import { Error } from "../common";

@Meta(Alias, 'int')
@Meta(ForSchema, [SCHEMA_KIND_INT])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.int`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(InVisible, true)
@Meta(Default, true)
@Meta(Static, true)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.int.error`)
export class IntValue extends Property<number> implements IConstraintProperty {
  override get hasValue(): boolean { return true; }

  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty) return undefined;
    const value = node.getValue() as number;
    return !isNull(value) && !isNaN(value);
  }
}
