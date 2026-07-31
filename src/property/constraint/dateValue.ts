import { Property } from "..";
import { Meta } from "../../attribute";
import { IValueAccess } from "../../runtime/interfaces";
import { SCHEMA_KIND_DATE, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_BOOL, isNull } from "../../utility";
import { InVisible, Default } from "../common";
import { IConstraintProperty } from "../constraintProperty";
import { Alias, ForSchema, OfSchema, SchemaType, PropertyValueType, Static } from "../core";
import { Error } from "../common";

@Meta(Alias, 'date')
@Meta(ForSchema, [SCHEMA_KIND_DATE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.date`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(InVisible, true)
@Meta(Default, true)
@Meta(Static, true)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.date.error`)
export class DateValue extends Property<Date> implements IConstraintProperty {
  override get hasValue(): boolean { return true; }

  async validate(node: IValueAccess): Promise<boolean | undefined> { 
    if (node.isEmpty) return undefined;
    const value = node.getValue() as Date;
    return !isNull(value) && !isNaN(value.getTime());
  }
}
