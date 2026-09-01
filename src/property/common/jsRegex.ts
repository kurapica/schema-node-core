import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { Alias } from '../core/alias';
import { ConstraintProperty } from '../constraintProperty';
import { Error } from '../common/error';

import type { IValueAccess } from '../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_PROPERTY_COMMON } from '../../utility/constant';

@Meta(Alias, 'jsregex')
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.jsregex`)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.jsregex.error`)
export class JsRegex extends ConstraintProperty<string> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    const value = node.rawValue;
    if (Array.isArray(value)) 
      return value.filter(v => v !== undefined).every(v => new RegExp(this._value!).test(v as string ?? ''));
    return new RegExp(this._value).test(value as string ?? '');
  }
}