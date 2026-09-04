import { Meta } from '../../../attribute/meta';
import { OfSchema } from '../../../property/core/ofSchema';
import { SchemaType } from '../../../property/core/schemaType';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { ForSchema } from '../../../property/core/forSchema';
import { Error } from '../../../property/common/error';
import { ConstraintProperty } from '../../../property/constraintProperty';
import { EnumType } from '../../../schema/enum/runtime';
import { ArrayType } from '../../../schema/array/runtime';

import type { IValueAccess } from '../../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_BOOL, SCHEMA_KIND_ENUM, SCHEMA_KIND_ENUM_USAGE, NS_SYSTEM_SCHEMA_PRO_ENUM } from '../../../utility/constant';
import { CascadeDepth } from './cascadeDepth';

@Meta(ForSchema, [SCHEMA_KIND_ENUM, SCHEMA_KIND_ENUM_USAGE])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_ENUM}.leafonly`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PRO_ENUM}.leafonly.error`)
export class LeafOnly extends ConstraintProperty<boolean> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    const cascadeDepth = node.getPropertyValue<number>(CascadeDepth);
    if (node.type.kind === SCHEMA_KIND_ENUM) {
      return await this.isLeafNode(node.type as EnumType, node.getValue() as string, cascadeDepth);
    }
    else if (node.type instanceof ArrayType && node.type.element?.kind === SCHEMA_KIND_ENUM)
    {
      const values = node.getValue() as unknown[];
      for(let value of values)
        if(!await this.isLeafNode(node.type.element as EnumType, value as string, cascadeDepth)) return false;
      return true;
    }
    return undefined;
  }

  private async isLeafNode(type: EnumType, value: string, cascadeDepth: number | undefined): Promise<boolean | undefined> {
    const access = await type.getEnumEntryAccess(value);
    if (!access?.length) return undefined;
    return !(access[access.length - 1].entry?.hasChildren) || (cascadeDepth ? (access.length - 1 <= cascadeDepth) : false);
  }
}
