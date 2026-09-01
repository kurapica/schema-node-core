import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { buildFuncCall } from '../../schema/function/type';
import { OverrideType } from '../core/overrideType';
import { ConstraintProperty } from '../constraintProperty';
import { AsSuggest } from '../common/asSuggest';
import { Error } from '../common/error';
import { isNull } from '../../utility/toolset';
import { Relation } from '../../attribute/relation';

import type { IValueAccess } from '../../interface';

import { SCHEMA_KIND_PROPERTY,  NS_SYSTEM_LIST, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, NODE_TYPE, NS_SYSTEM_SCHEMA_PROPERTY_COMMON } from '../../utility/constant';

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.whitelist`)
@Meta(PropertyValueType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_STRING}>`)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.whitelist.error`)
@Relation(OverrideType,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getarraytype`, NODE_TYPE))
export class WhiteList extends ConstraintProperty<string[]> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    const value = node.getValue();
    if (isNull(value) || !this._value?.length || node.getPropertyValue(AsSuggest)) return undefined;
    return Array.isArray(value)
      ? value.every(v => this._value!.some(i => `${i}` === `${v}`))
      : this._value.some(i => `${i}` === `${value}`);
  }
}