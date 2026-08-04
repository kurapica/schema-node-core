// =============================================================================
// Mirrors C# SchemaNode.Core/Property/Common/Default.cs
// =============================================================================

import { Property } from '../property';
import { Meta } from '../../attribute/meta';
import { OfSchema, ForSchema, SchemaType, PropertyValueType, buildFuncCall, BlackList, Cascade, LeafOnly, OverrideType, Root, SingleFlag, Visible, WhiteList } from '../index';
import { SCHEMA_KIND_PROPERTY, SCHEMA_KIND_BOOL, SCHEMA_KIND_STRING, SCHEMA_KIND_DATE, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_INT, NS_SYSTEM_SCHEMA_PROPERTY_COMMON, NS_SYSTEM_OBJECT, SCHEMA_KIND_FUNC_ARG, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_INTRINSIC, NS_SYSTEM_SCHEMA_REFLECT, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, SCHEMA_KIND_ENUM, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND } from '../../utility/constant';
import { IValueAccess } from '../../runtime';
import { isEmpty, isEqual } from '../../utility';
import { Relation } from '../../attribute';
import { Call } from '../../relation';

/** The Default property represents the default value */
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_PROPERTY_COMMON}.default`)
@Meta(PropertyValueType, NS_SYSTEM_OBJECT)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, '@type', true, SCHEMA_KIND_ENUM, SCHEMA_KIND_BOOL, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_STRING, SCHEMA_KIND_DATE))
@Relation(OverrideType, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getarrayelement`, '@type'))
@Relation(WhiteList, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@whiteList'))
@Relation(BlackList, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@blackList'))
@Relation(Root, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@root'))
@Relation(LeafOnly, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@leafOnly'))
@Relation(Cascade, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@cascade'))
@Relation(SingleFlag, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@singleFlag'))
export class Default extends Property<unknown> {
    override effect(target: IValueAccess, newValue?: unknown | undefined, oldValue?: unknown | undefined): void {
        const origin = target.getValue();
        if (isEmpty(origin) || isEqual(origin, oldValue))
            target.setValue(newValue);
    }
}
