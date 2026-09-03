import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { buildFuncCall } from '../../schema/function/type';
import { OverrideType } from '../core/overrideType';
import { ConstraintProperty } from '../constraintProperty';
import { Error } from '../common/error';
import { Relation } from '../../attribute/relation';

import type { IValueAccess } from '../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PRO_COMMON, NS_SYSTEM_LIST, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, TYPE_PROVIDER } from '../../utility/constant';

@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_COMMON}.blacklist`)
@Meta(PropertyValueType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_STRING}>`)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PRO_COMMON}.blacklist.error`)
@Relation(OverrideType,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getarraytype`, TYPE_PROVIDER))
export class BlackList extends ConstraintProperty<string[]> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value?.length) return undefined;
    const value = node.getValue();
    return Array.isArray(value)
      ? value.every(v => this._value!.every(i => `${i}` !== `${v}`))
      : this._value.every(i => `${i}` !== `${value}`);
  }
}
