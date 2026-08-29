import { Meta } from '../../attribute/meta';
import { OfSchema } from '../core/ofSchema';
import { SchemaType } from '../core/schemaType';
import { PropertyValueType } from '../core/propertyValueType';
import { ForSchema } from '../core/forSchema';
import { buildFuncCall } from '../../schema/function/type';
import { ConstraintProperty } from '../constraintProperty';
import { Error } from '../common/error';
import { Visible } from '../common/visible';
import { Relation } from '../../attribute/relation';
import { EnumValueType } from '../../enum/enumValueType/type';

import type { IValueAccess } from '../../interface';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT, NS_SYSTEM_BOOL, SCHEMA_KIND_ENUM, NS_SYSTEM_SCHEMA_REFLECT_ENUM, SCHEMA_KIND_STRUCT_FIELD } from '../../utility/constant';

@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.singleflag`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PROPERTY_CONSTRAINT}.singleflag.error`)
@Relation(Visible,'call', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ENUM}.isenumvaluetype`, "@type", EnumValueType.Flags))
export class SingleFlag extends ConstraintProperty<boolean> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value || !(node.type.kind === SCHEMA_KIND_ENUM)) return undefined;
    const val = parseInt(node.toString());
    if (!val || isNaN(val)) return undefined;
    return (val & (val - 1)) === 0;
  }
}
