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

import type { IValueAccess } from "../../interface";

import { NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, SCHEMA_KIND_ENUM, SCHEMA_KIND_PROPERTY } from "../../utility/constant";

@Meta(Alias, 'bool')
@Meta(ForSchema, [SCHEMA_KIND_ENUM])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.bool`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(InVisible, true)
@Meta(Default, true)
@Meta(Static, true)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.bool.error`)
export class BoolValue extends ConstraintProperty<boolean> {
  override get hasValue(): boolean { return true; }
  async validate(node: IValueAccess): Promise<boolean | undefined>{ return undefined }
}
