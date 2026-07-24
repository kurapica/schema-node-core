import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, PropertyValueType, Alias, ForSchema, InVisible, Default, Static } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, SCHEMA_KIND_ENUM, NS_SYSTEM_BOOL } from '../../utility/constant';
import { IValueAccess } from '../../runtime/interfaces';
import { EnumArrayNode } from '../../node/enumArrayNode';
import { EnumNode } from '../../node/enumNode';
import { EnumType } from '../../runtime/type';
import { EnumValueType } from '../../enum/enumValueType';
import { isNull } from '../../utility/toolset';

@Meta(Alias, 'enum')
@Meta(ForSchema, [SCHEMA_KIND_ENUM])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.enum`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(InVisible, true)
@Meta(Default, true)
@Meta(Static, true)
export class EnumValue extends Property<boolean> implements IConstraintProperty {
  override get hasValue(): boolean { return true; }

  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty) return undefined;
    if (node instanceof EnumNode) {
      return this.validateEnumValue(node.type as EnumType, node.getValue());
    }
    else if (node instanceof EnumArrayNode)
    {
      const values = node.getValue() as unknown[];
      for(let value of values)
      {
        const valid = await this.validateEnumValue(node.type as EnumType, value);
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
      return typeof value === 'number' && value <= enumType.maxFlags;
    }

    const access = await enumType.getEnumEntryAccess(`${value}`);
    return access.length > 0;
  }
}
