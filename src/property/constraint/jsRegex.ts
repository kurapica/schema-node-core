import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { ForSchema } from '../core/forSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { Alias } from '../core/alias';
import { ConstraintProperty } from '../constraintProperty';
import { Error } from '../common/error';

import type { IValueAccess } from '../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, SCHEMA_KIND_STRING, NS_SYSTEM_STRING, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL } from '../../utility/constant';
import type { DataNode } from '../../schema';

@Meta(Alias, 'jsregex')
@Meta(ForSchema, [SCHEMA_KIND_STRING, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_INT])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.jsregex`)
@Meta(PropertyValueType, NS_SYSTEM_STRING)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.jsregex.error`)
export class JsRegex extends ConstraintProperty<string> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    const value = node.rawValue;
    if (Array.isArray(value)) 
      return value.filter(v => v !== undefined).every(v => new RegExp(this._value!).test(v as string ?? ''));
    return new RegExp(this._value).test(value as string ?? '');
  }
}