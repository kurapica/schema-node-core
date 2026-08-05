import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, PropertyValueType, ForSchema, buildFuncCall, EntrySource } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_INT, SCHEMA_KIND_ENUM, NS_SYSTEM_SCHEMA_REFLECT, NS_SYSTEM_SCHEMA_REFLECT_ENUM, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, SCHEMA_KIND_STRUCT_FIELD } from '../../utility/constant';
import { IValueAccess } from '../../runtime/interfaces';
import { EnumArrayNode } from '../../node/enumArrayNode';
import { EnumNode } from '../../node/enumNode';
import { EnumType } from '../../runtime/type';
import { Error, Visible } from '../common';
import { Relation } from '../../attribute';
import { Assign, Call } from '../../relation';

/** Limit the cascade level of the enum entry. */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.cascade`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.cascade.error`)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, "@type", true, SCHEMA_KIND_ENUM))
@Relation(EntrySource, Assign, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.getcascades`, "@type"))
export class Cascade extends Property<number> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    if (node instanceof EnumNode) {
          const access = await (node.type as EnumType).getEnumEntryAccess(node.toString());
          if (!access?.length) return undefined;
          return access.length <= this._value;
        }
        else if (node instanceof EnumArrayNode)
        {
          const values = node.getValue() as unknown[];
          for(let value of values)
          {
            const access = await (node.type as EnumType).getEnumEntryAccess(`${value}`);
            if (!access?.length) continue;
            if(access.length > this._value) return false;
          }
          return true;
        }
        return undefined;
  }
}
