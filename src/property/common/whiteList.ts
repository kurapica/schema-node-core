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
import { ForSchema } from '../core/forSchema';
import { ArrayType } from '../../schema/array/runtime';
import { EnumType } from '../../schema/enum/runtime';

import type { IValueAccess, IValueTypeAccess } from '../../interface';

import { SCHEMA_KIND_PROPERTY,  NS_SYSTEM_LIST, NS_SYSTEM_STRING, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, TYPE_PROVIDER, NS_SYSTEM_SCHEMA_PRO_COMMON, SCHEMA_KIND_ENUM, SCHEMA_KIND_STRING, SCHEMA_KIND_INT } from '../../utility/constant';

@Meta(ForSchema, [SCHEMA_KIND_ENUM, SCHEMA_KIND_STRING, SCHEMA_KIND_INT])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_COMMON}.whitelist`)
@Meta(PropertyValueType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_STRING}>`)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PRO_COMMON}.whitelist.error`)
@Relation(OverrideType,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getarraytype`, TYPE_PROVIDER))
export class WhiteList extends ConstraintProperty<string[]> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    const value = node.getValue();
    if (isNull(value) || Array.isArray(value) && !value.length || !this._value?.length || node.getPropertyValue(AsSuggest)) return undefined;

    // validate enum for cascade
    let type: IValueTypeAccess | undefined = node.type;
    if (type instanceof ArrayType) type = type.element;
    if (type instanceof EnumType) {
      if (Array.isArray(value)) {
        for(let v of value)
          if (!await this._validateEnum(type, `${v}`)) return false;
        return true;
      }
      else
        return await this._validateEnum(type, `${value}`);
    }

    // validate the value
    return Array.isArray(value)
      ? value.every(v => this._value!.some(i => `${i}` === `${v}`))
      : this._value.some(i => `${i}` === `${value}`);
  }

  private async _validateEnum(type: EnumType, value: string): Promise<boolean> {
    if (isNull(value)) return true;
    const access = await type.getEnumEntryAccess(value);
    return !access?.length || access.some(c => c.entry?.value && this._value?.some(i => `${i}` === `${c.entry?.value}`))
  }
}