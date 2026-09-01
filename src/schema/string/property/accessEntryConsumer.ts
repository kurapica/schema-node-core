import { Meta } from '../../../attribute/meta';
import { Relation } from '../../../attribute/relation';
import { ReadOnly } from '../../../property/common/readOnly';
import { InVisible } from '../../../property/common/invisible';
import { Valid } from '../../../property/common/valid';
import { FuncCallProperty } from '../../../property/funcCallProperty';
import { buildFuncCall } from '../../../schema/function/type';
import { ForSchema } from '../../../property/core/forSchema';
import { OfSchema } from '../../../property/core/ofSchema';
import { PropertyValueType } from '../../../property/core/propertyValueType';
import { SchemaType } from '../../../property/core/schemaType';
import { Static } from '../../../property/core/static';

import { SCHEMA_KIND_PROPERTY, NS_SYSTEM_SCHEMA_PROPERTY_STRING, NS_SYSTEM_SCHEMA_REFLECT_FUNC, NODE_SELF, NS_SYSTEM_BOOL, SCHEMA_KIND_STRING, NS_SYSTEM_SCHEMA_FUNC } from '../../../utility/constant';

/** The access value consumer property */
@Meta(ForSchema, [SCHEMA_KIND_STRING])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_STRING}.AccessEntryConsumer`)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_FUNC}.funccall`)
@Meta(Static, true)
@Meta(ReadOnly, true)
@Meta(InVisible, true)
@Relation(Valid,'assign', buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_FUNC}.withreturn`, NODE_SELF, NS_SYSTEM_BOOL), "accessValueTypeConsumer.func")
export class AccessEntryConsumer extends FuncCallProperty {}
