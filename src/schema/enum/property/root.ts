import { Meta } from '../../../attribute/meta';
import { Alias } from '../../../property/core/alias';
import { OfNodeKind } from '../../../property/core/ofNodeKind';
import { SchemaType } from '../../../property/core/schemaType';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { ForSchema } from '../../../property/core/forSchema';
import { ConstraintProperty } from '../../../property/constraintProperty';
import { Error } from '../../../property/common/error';
import { EnumType } from '../../../schema/enum/runtime';
import { ArrayType } from '../../../schema/array/runtime';
import { PropertyValueTypeResolver } from '../../../property/core/propertyValueTypeResolver';

import type { IValueAccess } from '../../../interface';

import { NODE_KIND_PROPERTY, SCHEMA_KIND_NODE_ENUM, NS_SYSTEM_SCHEMA_PRO_ENUM, SCHEMA_KIND_NODE_ENUM_USAGE, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, NODE_KIND_ENUM } from '../../../utility/constant';

/** The enum root value */
@Meta(Alias, 'root')
@Meta(ForSchema, [SCHEMA_KIND_NODE_ENUM, SCHEMA_KIND_NODE_ENUM_USAGE])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_ENUM}.root`)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PRO_ENUM}.root.error`)
@Meta(PropertyValueTypeResolver, `${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getarrayelement`)
export class Root extends ConstraintProperty<string> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    if (node.type.kind === NODE_KIND_ENUM) {
      const access = await (node.type as EnumType).getEnumEntryAccess(node.toString());
      if (!access?.length) return undefined;
      return access.some((item) => `${item.entry?.value}` === `${this._value}`);
    }
    else if (node.type instanceof ArrayType && node.type.element?.kind === NODE_KIND_ENUM)
    {
      const values = node.getValue() as unknown[];
      for(let value of values)
      {
        const access = await (node.type.element as EnumType).getEnumEntryAccess(`${value}`);
        if (!access?.length) continue;
        if(!access.some((item) => `${item.entry?.value}` === `${this._value}`)) return false;
      }
      return true;
    }
    return undefined;
  }
}
