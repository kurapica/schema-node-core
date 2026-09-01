import { Meta } from '../../../attribute/meta';
import { OfSchema } from '../../../property/core/ofSchema';
import { SchemaType } from '../../../property/core/schemaType';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { ForSchema } from '../../../property/core/forSchema';
import { ConstraintProperty } from '../../../property/constraintProperty';
import { Error } from '../../../property/common/error';
import { EnumType } from '../../../schema/enum/runtime';
import { ArrayType } from '../../../schema/array/runtime';

import type { IValueAccess } from '../../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_STRING, SCHEMA_KIND_ENUM, NS_SYSTEM_SCHEMA_PROPERTY_ENUM, SCHEMA_KIND_ENUM_USAGE } from '../../../utility/constant';

/** The enum root value */
@Meta(ForSchema, [SCHEMA_KIND_ENUM, SCHEMA_KIND_ENUM_USAGE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_ENUM}.root`)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_ENUM}.root.error`)
export class Root extends ConstraintProperty<string> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    if (node.type.kind === SCHEMA_KIND_ENUM) {
      const access = await (node.type as EnumType).getEnumEntryAccess(node.toString());
      if (!access?.length) return undefined;
      return access.some((item) => `${item.entry?.value}` === this._value!);
    }
    else if (node.type instanceof ArrayType && node.type.element?.kind === SCHEMA_KIND_ENUM)
    {
      const values = node.getValue() as unknown[];
      for(let value of values)
      {
        const access = await (node.type.element as EnumType).getEnumEntryAccess(`${value}`);
        if (!access?.length) continue;
        if(!access.some((item) => `${item.entry?.value}` === this._value!)) return false;
      }
      return true;
    }
    return undefined;
  }
}
