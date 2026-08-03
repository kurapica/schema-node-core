import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, PropertyValueType, ForSchema, buildFuncCall, Cascade, OverrideType } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_STRING, SCHEMA_KIND_ENUM, NS_SYSTEM_INTRINSIC, NS_SYSTEM_MATH, NS_SYSTEM_SCHEMA_REFLECT_ENUM } from '../../utility/constant';
import { IValueAccess } from '../../runtime/interfaces';
import { EnumNode } from '../../node/enumNode';
import { EnumArrayNode } from '../../node/enumArrayNode';
import { EnumType } from '../../runtime/type';
import { Error, Visible } from '../common';
import { Relation } from '../../attribute';
import { Call } from '../../relation';

@Meta(ForSchema, [SCHEMA_KIND_ENUM])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.root`)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.root.error`)
@Relation(Visible, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.hascascade`, "@type"))
@Relation(OverrideType, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, "@type"))
@Relation(Cascade, Call, buildFuncCall(`${NS_SYSTEM_MATH}.subtract`, "@cascade", 1))
export class Root extends Property<string> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    if (node instanceof EnumNode) {
      const access = await (node.type as EnumType).getEnumEntryAccess(node.toString());
      if (!access?.length) return undefined;
      return access.some((item) => `${item.entry?.value}` === this._value!);
    }
    else if (node instanceof EnumArrayNode)
    {
      const values = node.getValue() as unknown[];
      for(let value of values)
      {
        const access = await (node.type as EnumType).getEnumEntryAccess(`${value}`);
        if (!access?.length) continue;
        if(!access.some((item) => `${item.entry?.value}` === this._value!)) return false;
      }
      return true;
    }
    return undefined;
  }
}
