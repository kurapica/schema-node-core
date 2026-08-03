import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, SchemaType, PropertyValueType, ForSchema, buildFuncCall } from '../index';
import type { IConstraintProperty } from '../constraintProperty';
import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_BOOL, SCHEMA_KIND_ENUM, NS_SYSTEM_SCHEMA_REFLECT_ENUM } from '../../utility/constant';
import { IValueAccess } from '../../runtime/interfaces';
import { EnumNode } from '../../node/enumNode';
import { Error, Visible } from '../common';
import { Relation } from '../../attribute';
import { Call } from '../../relation';
import { EnumValueType } from '../../enum';

@Meta(ForSchema, [SCHEMA_KIND_ENUM])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.singleflag`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.singleflag.error`)
@Relation(Visible, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.isenumvaluetype`, "@type", EnumValueType.Flags))
export class SingleFlag extends Property<boolean> implements IConstraintProperty {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value || !(node instanceof EnumNode)) return undefined;
    const val = parseInt(node.toString());
    if (!val || isNaN(val)) return undefined;
    return (val & (val - 1)) === 0;
  }
}
