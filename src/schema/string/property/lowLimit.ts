import { Meta } from '../../../attribute/meta';
import { OfNodeKind } from '../../../property/core/ofNodeKind';
import { ForSchema } from '../../../property/core/forSchema';
import { SchemaType } from '../../../property/core/schemaType';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { Alias } from '../../../property/core/alias';
import { ConstraintProperty } from '../../../property/constraintProperty';
import { Error } from '../../../property/common/error';

import type { IValueAccess } from '../../../interface';

import { NODE_KIND_PROPERTY, NS_SYSTEM_INT, SCHEMA_KIND_NODE_STRING, SCHEMA_KIND_NODE_STRING_DEFINE, SCHEMA_KIND_NODE_STRING_USAGE, NS_SYSTEM_SCHEMA_PRO_STRING } from '../../../utility/constant';

@Meta(Alias, 'lowlimit')
@Meta(ForSchema, [SCHEMA_KIND_NODE_STRING, SCHEMA_KIND_NODE_STRING_DEFINE, SCHEMA_KIND_NODE_STRING_USAGE])
@Meta(OfNodeKind, NODE_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PRO_STRING}.lowlimit`)
@Meta(PropertyValueType, NS_SYSTEM_INT)
@Meta(Error, `${NS_SYSTEM_SCHEMA_PRO_STRING}.lowlimit.error`)
export class LowLimitString extends ConstraintProperty<number> {
  async validate(node: IValueAccess): Promise<boolean | undefined> {
    if (node.isEmpty || !this._value) return undefined;
    return node.toString().length >= this._value;
  }
}
