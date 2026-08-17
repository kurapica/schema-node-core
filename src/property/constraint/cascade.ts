import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { ForSchema } from '../core/forSchema';
import { buildFuncCall } from '../../schema/function/type';
import { EntrySource } from '../core/entrySource';
import { ConstraintProperty } from '../constraintProperty';
import { Error } from '../common/error';
import { Visible } from '../common/visible';
import { Relation } from '../../attribute/relation';
import { EnumType } from '../../schema/enum/runtime';
import { ArrayType } from '../../schema/array/runtime';

import type { IValueAccess } from '../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_INT, SCHEMA_KIND_ENUM, NS_SYSTEM_SCHEMA_REFLECT, NS_SYSTEM_SCHEMA_REFLECT_ENUM, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_STRUCT_FIELD } from '../../utility/constant';

/** Limit the cascade level of the enum entry. */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.cascade`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.cascade.error`)
@Relation(Visible,'call', buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, "@type", true, SCHEMA_KIND_ENUM))
@Relation(EntrySource,'assign', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.getcascades`, "@type"))
export class Cascade extends ConstraintProperty<number> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    if (node.type.kind === SCHEMA_KIND_ENUM) {
      const access = await (node.type as EnumType).getEnumEntryAccess(node.toString());
      if (!access?.length) return undefined;
      return access.length <= this._value;
    }
    else if (node.type instanceof ArrayType && node.type.element?.kind === SCHEMA_KIND_ENUM)
    {
      const values = node.getValue() as unknown[];
      for(let value of values)
      {
        const access = await (node.type.element as EnumType).getEnumEntryAccess(`${value}`);
        if (!access?.length) continue;
        if(access.length > this._value) return false;
      }
      return true;
    }
    return undefined;
  }
}
