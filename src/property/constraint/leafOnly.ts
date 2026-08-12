import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { ForSchema } from '../core/forSchema';
import { buildFuncCall } from '../../schema/function/type';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_BOOL, SCHEMA_KIND_ENUM, NS_SYSTEM_SCHEMA_REFLECT_ENUM } from '../../utility/constant';
import type { IValueAccess } from '../../interface';
import { Error } from '../common/error';
import { Visible } from '../common/visible';
import { Relation } from '../../attribute/relation';
import { Call } from '../../relation/call/meta';
import { ConstraintProperty } from '../constraintProperty';
import { EnumNode } from '../../schema/enum/node';
import { EnumType } from '../../schema/enum/runtime';
import { EnumArrayNode } from '../../schema/array/runtime';

@Meta(ForSchema, [SCHEMA_KIND_ENUM])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.leafonly`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.leafonly.error`)
@Relation(Visible, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.hascascade`, "@type"))
export class LeafOnly extends ConstraintProperty<boolean> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    if (node instanceof EnumNode) {
      const access = await (node.type as EnumType).getEnumEntryAccess(node.toString());
      if (!access?.length) return undefined;
      return !access[access.length - 1].entry?.hasChildren;
    }
    else if (node instanceof EnumArrayNode)
    {
      const values = node.getValue() as unknown[];
      for(let value of values)
      {
        const access = await (node.type as EnumType).getEnumEntryAccess(`${value}`);
        if (!access?.length) continue;
        if(access[access.length - 1].entry?.hasChildren) return false;
      }
      return true;
    }
    return undefined;
  }
}
