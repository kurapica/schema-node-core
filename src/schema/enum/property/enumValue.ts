import { Meta } from '../../../attribute/meta';
import { EnumValueType } from '../../../enum/enumValueType/type';
import { isNull } from '../../../utility/toolset';
import { Alias } from '../../../property/core/alias';
import { ForSchema } from '../../../property/core/forSchema';
import { OfNodeKind } from '../../../property/core/ofNodeKind';
import { SchemaType } from '../../../property/core/schemaType';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { InVisible } from '../../../property/common/invisible';
import { Default } from '../../../property/common/default';
import { Static } from '../../../property/core/static';
import { Error } from '../../../property/common/error';
import { ConstraintProperty } from '../../../property/constraintProperty';
import { EnumType } from '../runtime';
import { ArrayType } from '../../array/runtime';

import type { IValueAccess } from '../../../interface';

import { NODE_KIND_PROPERTY, SCHEMA_KIND_NODE_ENUM, NS_SYSTEM_BOOL, NS_SYSTEM_SCHEMA_PRO_ENUM, NODE_KIND_ENUM } from '../../../utility/constant';

@Meta(Alias, 'enum')
@Meta(ForSchema, [SCHEMA_KIND_NODE_ENUM])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_ENUM}.valid`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(InVisible, true)
@Meta(Default, true)
@Meta(Static, true)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PRO_ENUM}.valid.error`)
export class EnumValue extends ConstraintProperty<boolean> {
  override get hasValue(): boolean { return true; }

  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty) return undefined;
    if (node.type.kind === NODE_KIND_ENUM) {
      return this.validateEnumValue(node.type as EnumType, node.getValue());
    }
    else if (node.type instanceof ArrayType && node.type.element?.kind === NODE_KIND_ENUM)
    {
      const values = node.getValue() as unknown[];
      for(let value of values)
      {
        const valid = await this.validateEnumValue(node.type.element as EnumType, value);
        if (!valid) return false;
      }
      return true;
    }
    return undefined;
  }

  private async validateEnumValue(enumType: EnumType, value: unknown): Promise<boolean | undefined> {
    if (isNull(value)) return undefined;
    if (enumType.type === EnumValueType.Flags)
    {
      if (!enumType.maxFlags) return undefined;
      return typeof value === 'number' && value <= enumType.maxFlags && value >= 0;
    }

    const access = await enumType.getEnumEntryAccess(`${value}`);
    return access.length > 0;
  }
}
