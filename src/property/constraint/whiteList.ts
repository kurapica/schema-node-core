import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, PropertyValueType, buildFuncCall, OverrideType, BlackList, Cascade, Root } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_ENUM, SCHEMA_KIND_INT, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_LIST, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_REFLECT, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, SCHEMA_KIND_STRUCT_FIELD, SCHEMA_KIND_DECIMAL, NS_SYSTEM_INTRINSIC, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND } from '../../utility/constant';
import { IValueAccess } from '../../runtime/interfaces';
import { AsSuggest, Error, Visible } from '../common';
import { isNull } from '../../utility';
import { Relation } from '../../attribute';
import { Call } from '../../relation';

@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.whitelist`)
@Meta(PropertyValueType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_STRING}>`)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.whitelist.error`)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, "@type", true, SCHEMA_KIND_ENUM, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING))
@Relation(OverrideType, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getarraytype`, "@type"))
@Relation(BlackList, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, "@blackList"))
@Relation(Root, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, "@root"))
@Relation(Cascade, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, "@cascade"))
export class WhiteList extends Property<string[]> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    const value = node.getValue();
    if (isNull(value) || !this._value?.length || node.getPropertyValue(AsSuggest)) return undefined;
    return Array.isArray(value)
      ? value.every(v => this._value!.some(i => `${i}` === `${v}`))
      : this._value.some(i => `${i}` === `${value}`);
  }
}