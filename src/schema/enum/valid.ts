import { Meta } from '../../attribute/meta';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, SCHEMA_KIND_ENUM, NS_SYSTEM_BOOL } from '../../utility/constant';
import { EnumValueType } from '../../enum/enumValueType';
import { isNull } from '../../utility/toolset';
import { Alias } from '../../property/core/alias';
import { ForSchema } from '../../property/core/forSchema';
import { OfSchema } from '../../property/core/ofSchema';
import { SchemaType } from '../../property/core/schemaType';
import { PropertyValueType } from '../../property/core/propertyValueType';
import { InVisible } from '../../property/common/invisible';
import { Default } from '../../property/common/default';
import { Static } from '../../property/core/static';
import { Error } from '../../property/common/error';
import { ConstraintProperty } from '../../property/constraintProperty';
import type { IValueAccess } from '../../interface/valueAccess';
import { EnumNode } from './node';
import { EnumType } from './runtime';
import { EnumArrayNode } from './array';

@Meta(Alias, 'enum')
@Meta(ForSchema, [SCHEMA_KIND_ENUM])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.enum`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(InVisible, true)
@Meta(Default, true)
@Meta(Static, true)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.enum.error`)
export class EnumValue extends ConstraintProperty<boolean> {
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
      return typeof value === 'number' && value <= enumType.maxFlags && value >= 0;
    }

    const access = await enumType.getEnumEntryAccess(`${value}`);
    return access.length > 0;
  }
}
