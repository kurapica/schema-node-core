import { Meta } from '../../../attribute/meta';
import { OfNodeKind } from '../../../property/core/ofNodeKind';
import { SchemaType } from '../../../property/core/schemaType';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { ForSchema } from '../../../property/core/forSchema';
import { ConstraintProperty } from '../../../property/constraintProperty';
import { Error } from '../../../property/common/error';

import type { IValueAccess } from '../../../interface';

import { NODE_KIND_PROPERTY, NS_SYSTEM_BOOL, SCHEMA_KIND_NODE_ENUM, NS_SYSTEM_SCHEMA_PRO_ENUM, SCHEMA_KIND_NODE_ENUM_USAGE, NODE_KIND_ENUM } from '../../../utility/constant';

@Meta(ForSchema, [SCHEMA_KIND_NODE_ENUM, SCHEMA_KIND_NODE_ENUM_USAGE])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_ENUM}.singleflag`)
@Meta(PropertyValueType, NS_SYSTEM_BOOL)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PRO_ENUM}.singleflag.error`)
export class SingleFlag extends ConstraintProperty<boolean> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value || !(node.type.kind === NODE_KIND_ENUM)) return undefined;
    const val = parseInt(node.toString());
    if (!val || isNaN(val)) return undefined;
    return (val & (val - 1)) === 0;
  }
}
