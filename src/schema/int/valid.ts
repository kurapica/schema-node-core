import { Meta } from '../../attribute/meta';
import { Default } from '../../property/common/default';
import { InVisible } from '../../property/common/invisible';
import { Alias } from '../../property/core/alias';
import { ForSchema } from '../../property/core/forSchema';
import { OfSchema } from '../../property/core/ofSchema';
import { PropertyValueType } from '../../property/core/propertyValueType';
import { SchemaType } from '../../property/core/schemaType';
import { Static } from '../../property/core/static';
import { Error } from '../../property/common/error';
import { SCHEMA_KIND_INT, SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_BOOL } from '../../utility/constant';
import { isNull } from '../../utility/toolset';
import { ConstraintProperty } from '../../property/constraintProperty';
import type { IValueAccess } from '../../interface';

@Meta(Alias, 'int')
@Meta(ForSchema, [SCHEMA_KIND_INT])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.int`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(InVisible, true)
@Meta(Default, true)
@Meta(Static, true)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.int.error`)
export class IntValue extends ConstraintProperty<number> {
  override get hasValue(): boolean { return true; }

  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty) return undefined;
    const value = node.getValue() as number;
    return !isNull(value) && !isNaN(value);
  }
}
